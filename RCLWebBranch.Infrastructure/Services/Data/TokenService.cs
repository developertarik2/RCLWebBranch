using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RCLWebBranch.DATA.Entities;
using RCLWebBranch.Infrastructure.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace RCLWebBranch.Infrastructure.Services.Data
{
    public class TokenService:ITokenService
    {
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _key;

        public const string Issuer = "http://codingsonata.com";
        public const string Audience = "http://codingsonata.com";

        public const string Secret = "OFRC1j9aaR2BvADxNWlG2pmuD392UfQBZZLM1fuzDEzDlEpSsn+btrpJKd3FfY855OMA9oK4Mc8y48eYUrVUSw==";

        //public const string Secret = GenerateSecureSecret();
        public TokenService(IConfiguration config)
        {
            _config = config;
            //_key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Token:Key"]));
        }

        public static string GenerateSecureSecret()
        {
            var hmac = new System.Security.Cryptography.HMACSHA256();
            return Convert.ToBase64String(hmac.Key);
        }

        public string CreateToken(T_BRANCH_LOGIN user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.UniqueName,user.USERID),
                //new Claim(JwtRegisteredClaimNames.GivenName,user.UserName),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToString()),
                //new Claim("Role",role),
                //new Claim(ClaimTypes.Name,role),
            };
            //var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

            //var key = Convert.FromBase64String(GenerateSecureSecret());
            //var signingCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature);


            //var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("superSecretKey@345"));
            //var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);


            //var tokenDescriptor = new SecurityTokenDescriptor
            //{
            //    Subject = new ClaimsIdentity(claims),
            //    Expires = DateTime.UtcNow.AddMinutes(2),
            //    SigningCredentials = creds,
            //    //SigningCredentials = signingCredentials,
            //    Issuer = _config["Token:Issuer"],
            //};
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:Secret"]));
            var token = new JwtSecurityToken
                (
               issuer: _config["JWT:ValidIssuer"],
               audience: _config["JWT:ValidAudience"],
               expires: DateTime.UtcNow.AddMinutes(60),
               claims: claims,
               signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
               );


            var tokenHandler = new JwtSecurityTokenHandler();

            //var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);

        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public ClaimsPrincipal? GetPrincipalFromExpiredToken(string? token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:Secret"])),
                ValidateLifetime = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;
            //if (securityToken is not JwtSecurityToken jwtSecurityToken || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            //    throw new SecurityTokenException("Invalid token");
            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");
            return principal;

        }
    }
}
