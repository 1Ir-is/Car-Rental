package com.example.carrentalserver.security;

import com.example.carrentalserver.model.Role;
import com.example.carrentalserver.model.User;
import com.example.carrentalserver.repository.IUserRepository;
import com.example.carrentalserver.repository.IRoleRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final JwtProvider jwtProvider;
    private final IUserRepository userRepository;
    private final IRoleRepository roleRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String username = email; // hoặc lấy name nếu muốn

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            // Nếu user chưa tồn tại trong DB, tạo mới
            Role userRole = roleRepository.findByName("USER")
                    .orElseGet(() -> roleRepository.save(new Role(null, "USER", "User role")));
            user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(""); // Không cần password
            user.setStatus("ACTIVE");
            user.setRoles(Collections.singleton(userRole));
            userRepository.save(user);
        }

        String token = jwtProvider.generateToken(user);

        // Redirect về FE kèm JWT, ví dụ: http://localhost:3000/oauth2/redirect?token=...
        String redirectUrl = "http://localhost:3000/oauth2/redirect?token=" + token + "&username=" + username;
        response.sendRedirect(redirectUrl);
    }
}