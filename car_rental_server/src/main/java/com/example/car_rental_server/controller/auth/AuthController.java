package com.example.car_rental_server.controller.auth;

import com.example.car_rental_server.dto.LoginRequestDTO;
import com.example.car_rental_server.dto.RegisterRequestDTO;
import com.example.car_rental_server.model.Role;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.security.JwtService;
import com.example.car_rental_server.service.role.IRoleService;
import com.example.car_rental_server.service.user.IUserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final IUserService userService;
    private final IRoleService roleService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO req) {
        if (userService.existedByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email đã được sử dụng"));
        }
        Role userRole = roleService.findByName("USER")
                .orElseGet(() -> roleService.save(new Role(null, "USER")));
        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(req.getPassword());
        user.setName(req.getName());
        user.setPhone(req.getPhone());
        user.setAddress(req.getAddress());
        user.setRole(userRole);
        user.setStatus(true);
        userService.save(user);
        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            User user = (User) authentication.getPrincipal();
            if (!Boolean.TRUE.equals(user.getStatus())) {
                return ResponseEntity.status(403)
                        .body(Map.of("success", false, "error", "ACCOUNT_DISABLED"));
            }

            long maxAge = 3600; // 1h, hoặc bạn có thể lấy từ loginRequest nếu có rememberMe
            String token = jwtService.generateToken(user);
            ResponseCookie cookie = ResponseCookie.from("jwt", token)
                    .httpOnly(true)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(maxAge)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "error", "INVALID_CREDENTIALS"));
        } catch (DisabledException e) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "error", "ACCOUNT_DISABLED"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("success", false, "error", "SERVER_ERROR"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie clearCookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }

//    @PostMapping("/forgot-password")
//    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequestDTO req) {
//        // TODO: Gửi email reset password (nếu bạn triển khai)
//        // Nếu không, có thể trả về lỗi hoặc thông báo thành công giả lập
//        return ResponseEntity.ok(Map.of("message", "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đổi mật khẩu!"));
//    }
//
//    @PostMapping("/reset-password")
//    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequestDTO req) {
//        // TODO: Đổi mật khẩu dựa trên token/logic của bạn
//        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công!"));
//    }
//
//    @GetMapping("/status")
//    public ResponseEntity<?> checkAuthStatus(Authentication auth) {
//        if (auth == null || !auth.isAuthenticated()) {
//            return ResponseEntity.status(401).body(Map.of("authenticated", false));
//        }
//        return ResponseEntity.ok(Map.of("authenticated", true));
//    }
//
//    @GetMapping("/me")
//    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
//        if (authentication == null || !authentication.isAuthenticated()) {
//            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
//        }
//        User user = (User) authentication.getPrincipal();
//        return ResponseEntity.ok(UserSummaryDTO.from(user));
//    }
}