using AuthService.DTO.User;
using AuthService.Models;
using AutoMapper;

namespace AuthService.Mapping
{
    public class AuthProfile : Profile
    {
        public AuthProfile()
        {
            CreateMap<User, UserResponseDto>().ForMember(d => d.Role, o => o.MapFrom(s => s.Role.ToString()));
            CreateMap<User, UserAdminDto>().ForMember(d => d.Role, o => o.MapFrom(s => s.Role.ToString()));
        }
    }
}
