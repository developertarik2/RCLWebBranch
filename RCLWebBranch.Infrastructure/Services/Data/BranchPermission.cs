using RCLWebBranch.DATA.ViewModels;
using RCLWebBranch.Infrastructure.InterfaceRepo;
using RCLWebBranch.Infrastructure.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace RCLWebBranch.Infrastructure.Services.Data
{
    public class BranchPermission : IBranchPermission
    {
        private readonly IUnitOfWork _unitofWork;

        public BranchPermission(IUnitOfWork unitofWork)
        {
            _unitofWork = unitofWork;
        }

        public bool IsClientCodePermited(string userId, string rcode)
        {
            string queryCommand = "uSP_BRANCH_TEMING '" + userId + "','" + rcode + "'";
            var isValid = _unitofWork.SP_Call.ListByRawQuery<string?>(queryCommand).AsQueryable().FirstOrDefault();           
            if (string.IsNullOrEmpty(isValid))
            {
                return false;
            }
            else
                return true;
           // throw new NotImplementedException();
        }
    }
}
