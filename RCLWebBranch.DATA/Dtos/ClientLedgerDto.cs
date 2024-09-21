﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Dtos
{
    public class ClientLedgerDto
    {
        [Required]
        public string? Code { get; set; }

        [Required]
        public string? FromDate { get; set; }
        [Required]
        public string? ToDate { get; set; }
    }
}
