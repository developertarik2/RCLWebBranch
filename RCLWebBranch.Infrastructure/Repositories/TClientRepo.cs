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
    public class TClientRepo : Repository<ApplicationDbContext, T_CLIENT1>, ITClientRepo
    {
        private readonly ApplicationDbContext _db;
        public TClientRepo(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
