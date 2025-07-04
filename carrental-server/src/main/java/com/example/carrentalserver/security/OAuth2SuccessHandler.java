package com.example.carrentalserver.security;

import com.example.carrentalserver.model.Role;
import com.example.carrentalserver.model.User;
import com.example.carrentalserver.repository.IRoleRepository;
import com.example.carrentalserver.repository.IUserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
        String name = oAuth2User.getAttribute("name"); // tên từ tài khoản Google
        String username = (name != null && !name.isEmpty()) ? name : email;

        // Kiểm tra nếu đã có người dùng theo email
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Nếu chưa tồn tại, tạo user mới
            Role userRole = roleRepository.findByName("USER")
                    .orElseGet(() -> roleRepository.save(new Role(null, "USER", "User role")));
            user = new User();
            user.setUsername(username);  // lưu tên người dùng
            user.setEmail(email);
            user.setPassword(""); // không cần password cho OAuth2
            user.setStatus("ACTIVE");
            user.setRoles(Collections.singleton(userRole));
            userRepository.save(user);
        } else {
            // Nếu đã có user nhưng chưa có username (do lần đầu login là email), cập nhật lại tên thật
            if (user.getUsername() == null || user.getUsername().equals(user.getEmail())) {
                user.setUsername(username);
                userRepository.save(user);
            }
        }

        String token = jwtProvider.generateToken(user);

        // Redirect về frontend kèm JWT và username
        String encodedUsername = URLEncoder.encode(username, StandardCharsets.UTF_8);
        String redirectUrl = "http://localhost:3000/oauth2/redirect?token=" + token + "&username=" + encodedUsername;

        response.sendRedirect(redirectUrl);
    }
}
