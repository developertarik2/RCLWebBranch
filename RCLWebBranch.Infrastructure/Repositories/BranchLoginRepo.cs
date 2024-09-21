using RCLWebBranch.DATA.Entities;
using RCLWebBranch.Infrastructure.Data;
using RCLWebBranch.Infrastructure.InterfaceRepo;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.Infrastructure.Repositories
{
    public class BranchLoginRepo : Repository<ApplicationDbContext, T_BRANCH_LOGIN>, IBranchLoginRepo
    {
        private readonly ApplicationDbContext _db;
        public BranchLoginRepo(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
