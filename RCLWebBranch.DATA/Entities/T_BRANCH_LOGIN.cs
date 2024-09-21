﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.DATA.Entities
{
    [Table("T_BRANCH_LOGIN")]
    public class T_BRANCH_LOGIN
    {
        public decimal BRANCHCODE { get; set; }

        public string? BRANCHNAME { get; set; }

        [Key]
        public string USERID { get; set; }

        public string? USERTYPE { get; set; }

        public string? UESRNAME { get; set; }

        public string? BRANCH_PREFIX { get; set; }

        public string? AGENT_PREFIX { get; set; }

        public string? Password { get; set; }

        public decimal? LOCK { get; set; }

        public string TCODE { get; set; }
    }
}
