using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Dtos
{
    public class NextYear
    {
        public string? Text { get; set; }
        public string? Value { get; set; }

        public NextYear(string? text, string? value)
        {
            Text = text;
            Value = value;
        }
    }
}
