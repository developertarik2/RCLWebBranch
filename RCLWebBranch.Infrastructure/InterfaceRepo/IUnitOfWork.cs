
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.Infrastructure.InterfaceRepo
{
    public interface IUnitOfWork : IDisposable
    {
        Task Complete();
        IBranchLoginRepo BranchLogin { get; }
        ITClientRepo TClient { get; }
        ISP_Call SP_Call { get; }
       
    }
}
