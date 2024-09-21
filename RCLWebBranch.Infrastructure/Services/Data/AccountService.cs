using RCLWebBranch.DATA.Dtos;
using RCLWebBranch.Infrastructure.InterfaceRepo;
using RCLWebBranch.Infrastructure.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.Infrastructure.Services.Data
{
    public class AccountService:IAccountService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AccountService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<bool> CheckAuthentication(LoginDto loginDto)
        {
            var user = await _unitOfWork.BranchLogin.GetFirstOrDefault(u => u.USERID.ToUpper() == loginDto.Username.ToUpper());
            if (user != null)
            {
                if (user.USERID.ToUpper() == loginDto.Username.ToUpper() && user.Password==loginDto.Password)
                {
                    return true;
                }
                else
                    return false;
            }
            else
                return false;
            //throw new NotImplementedException();
        }

        public async Task<bool> IsLocked(LoginDto loginDto)
        {
            var user = await _unitOfWork.BranchLogin.GetFirstOrDefault(u => u.USERID == loginDto.Username && u.Password==loginDto.Password);
            if (user != null)
            {
                if(user.LOCK ==0)
                    return true;
                else if (user.LOCK ==1)
                    return false;
                else return false;
            }
            else
                return false;
        }
    }
}
