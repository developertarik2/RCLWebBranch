using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Models
{
    public class ClientConfirmation
    {
        public List<ConfirmationDetailsVM>? ConfirmationDetailsList { get; set; }
        public string? Ledger { get; set; }
        public string? Reciept { get; set; }
        public string? Payment { get; set; }
        public string? NetAmountTrading { get; set; }
        public string? ClosingBalance { get; set; }
    }
}
