using RCLWebBranch.DATA.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.Infrastructure.Services.Interfaces
{
    public interface IWebTrackerService
    {
        Task InsertToTracker(string action_type, string user_id, string remoteIpAddress, int status = 1);
       
    }
}
