using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RCLWebBranch.DATA.Dtos;
using RCLWebBranch.Errors;
using RCLWebBranch.Infrastructure.Data;
using RCLWebBranch.Infrastructure.InterfaceRepo;
using RCLWebBranch.Infrastructure.Services.Interfaces;
using System.Security.Claims;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace RCLWebBranch.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ITokenService _tokenService;
        private readonly IAccountService _accountService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebTrackerService _webTrackerService;
        public AccountController(ITokenService tokenService, IUnitOfWork unitOfWork, IAccountService accountService, IWebTrackerService webTrackerService)
        {
            _tokenService = tokenService;
            _unitOfWork = unitOfWork;
            _accountService = accountService;
            _webTrackerService = webTrackerService;
        }
        [Authorize]
        [HttpGet]
        [Route("getUser")]
        public async Task<ActionResult<LoggedUserDto>> GetCurrentUser()
        {
            var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
          

            var user = await _unitOfWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);
          
            return new LoggedUserDto
            {
                Username = user.USERID,            
                BranchName = user.BRANCHNAME,   
                BranchCode=user.BRANCHCODE.ToString(),
            };
        }
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var user = await _unitOfWork.BranchLogin.GetFirstOrDefault(u => u.USERID.ToUpper() == loginDto.Username.ToUpper());
                    var remoteIpAddress = HttpContext.Connection.RemoteIpAddress;

                    if (user == null)
                    {
                       // insert_to_tracker("login", loginDto.Username?.Trim(), 0);
                        await _webTrackerService.InsertToTracker("login", loginDto.Username?.Trim(),remoteIpAddress.ToString(), 0);
                       // return Unauthorized(new ApiResponse(401, "Invalid login attempt!"));
                        return Unauthorized( "Invalid login attempt!");
                    }


                    if (!await _accountService.CheckAuthentication(loginDto))
                    {
                        insert_to_tracker("login", loginDto.Username?.Trim(), 0);
                        return Unauthorized(new ApiResponse(401, "Invalid login attempt!!"));
                    }
                    if (user.LOCK == 0)
                    {
                        return Unauthorized(new ApiResponse(401, "Account is locked!!"));
                    }

                    var accessToken = _tokenService.CreateToken(user);
                    //insert_to_tracker("login", user.USERID.ToString(), 1);
                    await _webTrackerService.InsertToTracker("login", user.USERID, remoteIpAddress.ToString(), 1);

                    return new UserDto
                    {
                        Username = user.USERID,
                        Token = accessToken,
                        BranchName = user.BRANCHNAME,
                        BranchCode = user.BRANCHCODE.ToString(),
                    };
                }
                catch (Exception ex)
                {
                    return BadRequest(new ApiResponse(500,"Server Error!!"));
                }
            }
            var message = string.Join(" | ", ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage));
            return BadRequest(message);
        }

        [Authorize]
        [HttpPost("passwordChange")]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto change)
        {
            //var username = HttpContext?.User.FindFirstValue(ClaimTypes.Name);

            var username = HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
            var user = await _unitOfWork.BranchLogin.GetFirstOrDefault(u => u.USERID == username);

            var remoteIpAddress = HttpContext.Connection.RemoteIpAddress;

            if (user == null)
               return Unauthorized();

            if(string.IsNullOrEmpty(change.OldPassword?.Trim()))
            {
                ModelState.AddModelError("", "OLd Password field can't be empty");
            }
            if(change.NewPassword?.Trim() != change.NewConfirmPassword?.Trim())
            {
                ModelState.AddModelError("", "New Password field and Confirm Password does not match!!!");
            }

            if(ModelState.IsValid)
            {
                if(change.NewPassword?.Trim()==change.NewConfirmPassword?.Trim())
                {

                    var validUser = await _unitOfWork.BranchLogin.GetFirstOrDefault(u => u.USERID == user.USERID);

                    if (validUser.Password == change.OldPassword?.Trim())
                    {
                        string qry_update = "UPDATE T_BRANCH_LOGIN SET password='" + change.NewPassword?.Trim().Trim() + "' WHERE BRANCHCODE=" + user.BRANCHCODE + " AND USERID='" + user.USERID + "'";
                        await _unitOfWork.SP_Call.ExecuteWithoutReturnByQuery(qry_update);

                        // insert_to_tracker("Password Change", user.USERID.ToString());
                        await _webTrackerService.InsertToTracker("Password Change", user.USERID, remoteIpAddress.ToString(), 1);
                        return Ok(new ApiResponse(200,"Password changed successfully!!!"));
                    }
                    else
                    {
                        return BadRequest(new ApiResponse(400, "Invalid old password!!!!"));
                    }
                }
            }
            var message = string.Join(" | ", ModelState.Values
                 .SelectMany(v => v.Errors)
                 .Select(e => e.ErrorMessage));
            return new BadRequestObjectResult(new ApiValidationErrorResponse { Errors = new[] { message } });
            //return BadRequest(new ApiResponse(400, change));
            
            //return Ok();
        }

        async void insert_to_tracker(string action_type, string user_id, int status = 1)
        {
            var remoteIpAddress = HttpContext.Connection.RemoteIpAddress;


            string query = @"INSERT INTO T_WEB_USER_TRACKER (user_id, IP_address, action_type, status) VALUES ('" + user_id + "', '" + remoteIpAddress + "', '" + action_type + "', " + status + ")";
            await _unitOfWork.SP_Call.ExecuteWithoutReturnByQuery(query);
        }
    }
}
