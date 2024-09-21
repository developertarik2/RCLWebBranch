using RCLWebBranch.DATA.ViewModels;
using RCLWebBranch.Infrastructure.InterfaceRepo;
using RCLWebBranch.Insfrastructures.Services.Interfaces;

namespace RCLWebBranch.Insfrastructures.Services
{
    public class ClientService : IClientService
    {
        private readonly IUnitOfWork _unitofWork;

        public ClientService(IUnitOfWork unitofWork)
        {
            _unitofWork = unitofWork;
        }
        public ClientDetailsVM? GetClientDetails(string? code)
        {
            string query2 = @"SELECT acode,aname,boid,(RTRIM(LTRIM(addr1))+' '+RTRIM(LTRIM(addr2))+' ' +city) address,faname,moname FROM T_CLIENT WHERE acode='"+code+"'";
            var client = _unitofWork.SP_Call.ListByRawQueryBySis<ClientDetailsVM>(query2).AsQueryable().FirstOrDefault();
            return client;
            //if (client == null)
            //{
            //    return null;
            //}
            //throw new NotImplementedException();
        }
    }
}
