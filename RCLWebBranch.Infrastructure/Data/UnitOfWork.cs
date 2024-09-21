using RCLWebBranch.Infrastructure.InterfaceRepo;
using RCLWebBranch.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.Infrastructure.Data
{
    public class UnitOfWork: IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private readonly SISRoyalDbContext _sisDb;

        public UnitOfWork(ApplicationDbContext context, SISRoyalDbContext sisDb)
        {
            _context = context;
            _sisDb = sisDb;
            BranchLogin = new BranchLoginRepo(_context);
            TClient = new TClientRepo(_context);
            SP_Call=new SP_Call(_context, _sisDb);
        }

        public IBranchLoginRepo BranchLogin {  get;private set; }
        public ITClientRepo TClient { get; private set; }
        public ISP_Call SP_Call { get; private set; }

        

        public async Task Complete()
        {
            if (_context.ChangeTracker.HasChanges())
              await  _context.SaveChangesAsync();
           
        }

        public void Dispose()
        {
            _context.Dispose();
        }

    }
}
