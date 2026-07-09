using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YoutubeApiApplication.Bases;
using YoutubeApiApplication.Features.Auth.Rules;
using YoutubeApiApplication.Interfaces.AutoMapper;
using YoutubeApiApplication.Interfaces.Tokens;
using YoutubeApiApplication.Interfaces.UnitOfWorks;
using YoutubeApiDomain.Entities;

namespace YoutubeApiApplication.Features.Auth.Command.Register
{
    public class RegisterCommandHandler : BaseHandler, IRequestHandler<RegisterCommandRequest, RegisterCommandResponse>
    {
        private readonly ITokenService tokenService;
        private readonly AuthRules authRules;
        private readonly UserManager<User> userManager;
        private readonly RoleManager<Role> roleManager;

        public RegisterCommandHandler(ITokenService tokenService, AuthRules authRules, UserManager<User> userManager, RoleManager<Role> roleManager, IMapper mapper, IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor) : base(mapper,unitOfWork,httpContextAccessor)
        {
            this.tokenService = tokenService;
            this.authRules = authRules;
            this.userManager = userManager;
            this.roleManager = roleManager;
        }
        public async Task<RegisterCommandResponse> Handle(RegisterCommandRequest request, CancellationToken cancellationToken)
        {
            await authRules.UserShouldNotBeExist(await userManager.FindByEmailAsync(request.Email));

            User user = mapper.Map<User, RegisterCommandRequest>(request);
            user.UserName = request.Email;
            user.SecurityStamp = Guid.NewGuid().ToString();

            IdentityResult result = await userManager.CreateAsync(user , request.Password);
            if (result.Succeeded)
            {
                if (!await roleManager.RoleExistsAsync("user"))
                    await roleManager.CreateAsync(new Role
                    {
                        Id = Guid.NewGuid(),
                        Name = "user",
                        NormalizedName = "USER",
                        ConcurrencyStamp = Guid.NewGuid().ToString(),
                    });

                await userManager.AddToRoleAsync(user, "user");

                var roles = await userManager.GetRolesAsync(user);
                JwtSecurityToken jwtSecurityToken = await tokenService.CreateToken(user, roles);
                string accessToken = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);

                string refreshToken = tokenService.GenerateRefreshToken();

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);

                await userManager.UpdateAsync(user);

                return new RegisterCommandResponse
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    Expiration = jwtSecurityToken.ValidTo
                };

            }
            throw new Exception("An error occured during the registration: " + string.Join(", ", result.Errors.Select(x => x.Description)));
        }
    }
}
