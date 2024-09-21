using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.Infrastructure.InterfaceRepo
{
    public interface IRepository<T> where T : class
    {
        Task<T> GetFirstOrDefault(
            Expression<Func<T, bool>> filter = null,
               Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
              string includeProperties = null
            );

       

        Task<IReadOnlyList<T>> GetAll(
             Expression<Func<T, bool>> filter = null,
             Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
             string includeProperties = null, bool? isPaging = null, int? pageIndex = null, int? pageSize = null
                 );
    }
}
