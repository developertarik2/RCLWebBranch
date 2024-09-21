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
    public class WebTrackerService:IWebTrackerService
    {
        private readonly IUnitOfWork _unitOfWork;

        public WebTrackerService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task InsertToTracker(string action_type, string user_id, string remoteIpAddress, int status = 1)
        {
            string query = @"INSERT INTO T_WEB_USER_TRACKER (user_id, IP_address, action_type, status) VALUES ('" + user_id + "', '" + remoteIpAddress + "', '" + action_type + "', " + status + ")";
            await _unitOfWork.SP_Call.ExecuteWithoutReturnByQuery(query);
        }
    }
}
