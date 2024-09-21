using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Dtos
{
    public class ThisYear
    {
        public string? Text { get; set; }
        public string? Value { get; set; }

        public ThisYear(string? text, string? value)
        {
            Text = text;
            Value = value;
        }
    }
}
