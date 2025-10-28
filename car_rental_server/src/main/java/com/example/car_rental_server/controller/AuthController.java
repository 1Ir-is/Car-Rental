package com.example.car_rental_server.controller;

import com.example.car_rental_server.dto.GoogleLoginRequestDTO;
import com.example.car_rental_server.dto.LoginRequestDTO;
import com.example.car_rental_server.dto.RegisterRequestDTO;
import com.example.car_rental_server.dto.VerifyOtpRequestDTO;
import com.example.car_rental_server.model.Role;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.security.JwtService;
import com.example.car_rental_server.service.role.IRoleService;
import com.example.car_rental_server.service.user.IUserService;
import com.example.car_rental_server.utils.MailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${google.client-id}")
    private String googleClientId;

    @Value("${google.client-secret}")
    private String googleClientSecret;

    private final IUserService userService;
    private final IRoleService roleService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;

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

        // Generate OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setEmailOtp(otp);
        user.setOtpCreatedAt(LocalDateTime.now());
        user.setVerified(false);
        userService.save(user);

        try {
            mailService.sendOtpEmail(user.getEmail(), user.getName(), otp);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi gửi email xác thực"));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "needVerify", true,
                "message", "Đăng ký thành công, vui lòng kiểm tra email để lấy mã xác thực!"
        ));
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<?> verifyEmailOtp(@RequestBody VerifyOtpRequestDTO req) {
        Optional<User> userOpt = userService.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        User user = userOpt.get();
        if (user.getEmailOtp() != null
                && user.getEmailOtp().equals(req.getOtp())
                && user.getOtpCreatedAt() != null
                && user.getOtpCreatedAt().isAfter(LocalDateTime.now().minusMinutes(15))) {
            user.setVerified(true);
            user.setEmailOtp(null);
            user.setOtpCreatedAt(null);
            userService.save(user);
            return ResponseEntity.ok(Map.of("success", true, "message", "Email đã được xác thực!"));
        }
        return ResponseEntity.status(400).body(Map.of("success", false, "error", "Mã OTP không đúng hoặc đã hết hạn"));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "User not found"));
        }
        User user = userOpt.get();

        // Sinh lại OTP mới
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setEmailOtp(otp);
        user.setOtpCreatedAt(LocalDateTime.now());
        user.setVerified(false);
        userService.save(user);

        try {
            mailService.sendOtpEmail(user.getEmail(), user.getName(), otp);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã gửi lại mã xác thực OTP qua email!"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "error", "Lỗi khi gửi lại email xác thực"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Trả về thành công giả lập để tránh dò email
            return ResponseEntity.ok(Map.of("success", true, "message", "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đổi mật khẩu."));
        }
        User user = userOpt.get();
        // Tạo mã token reset password (có thể là UUID)
        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        user.setResetTokenCreatedAt(LocalDateTime.now());
        userService.save(user);

        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;

        try {
            mailService.sendResetPasswordEmail(user.getEmail(), user.getName(), resetUrl);
            return ResponseEntity.ok(Map.of("success", true, "message", "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đổi mật khẩu."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "error", "Không thể gửi email!"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("password");
        Optional<User> userOpt = userService.findByResetPasswordToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("success", false, "error", "Token không hợp lệ hoặc đã hết hạn"));
        }
        User user = userOpt.get();

        // Kiểm tra thời gian hiệu lực token
        if (user.getResetTokenCreatedAt() == null || user.getResetTokenCreatedAt().isBefore(LocalDateTime.now().minusMinutes(30))) {
            return ResponseEntity.status(400).body(Map.of("success", false, "error", "Token đã hết hạn"));
        }

        // Kiểm tra password mới có giống password cũ không?
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            return ResponseEntity.status(400).body(Map.of("success", false, "error", "Bạn đã nhập mật khẩu trước đó của bạn"));
        }

        user.setPassword(newPassword);
        user.setResetPasswordToken(null);
        user.setResetTokenCreatedAt(null);
        user.setPasswordChangedAt(LocalDateTime.now());
        userService.save(user);

        return ResponseEntity.ok(Map.of("success", true, "message", "Đổi mật khẩu thành công!"));
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        Optional<User> userOpt = userService.findByResetPasswordToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("success", false, "error", "Token không hợp lệ hoặc đã hết hạn"));
        }
        User user = userOpt.get();
        if (user.getResetTokenCreatedAt() == null
                || user.getResetTokenCreatedAt().isBefore(LocalDateTime.now().minusMinutes(30))) {
            return ResponseEntity.status(400).body(Map.of("success", false, "error", "Token đã hết hạn"));
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/get-old-password-hash")
    public ResponseEntity<?> getOldPasswordHash(@RequestParam String token) {
        Optional<User> userOpt = userService.findByResetPasswordToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("success", false, "error", "Token không hợp lệ hoặc đã hết hạn"));
        }
        User user = userOpt.get();
        return ResponseEntity.ok(Map.of("success", true, "oldPasswordHash", user.getPassword()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("success", false, "error", "Chưa đăng nhập"));
        }
        String email = authentication.getName();
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("success", false, "error", "User not found"));
        }
        User user = userOpt.get();

        // Dùng passwordEncoder để kiểm tra
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(400).body(Map.of("success", false, "error", "Mật khẩu cũ không đúng"));
        }

        user.setPassword(newPassword);
        user.setPasswordChangedAt(LocalDateTime.now());
        userService.save(user);

        return ResponseEntity.ok(Map.of("success", true, "message", "Đổi mật khẩu thành công!"));
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
                        .body(Map.of("success", false, "error", "ACCOUNT_DISABLED", "message", "Tài khoản đã bị tạm ngừng"));
            }
            if (!user.getVerified()) {
                return ResponseEntity.status(403)
                        .body(Map.of(
                                "success", false,
                                "error", "EMAIL_NOT_VERIFIED",
                                "message", "Email chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản."
                        ));
            }

            long maxAge = 3600;
            String token = jwtService.generateToken(user);

            // Set-Cookie như cũ
            Cookie cookie = new Cookie("jwt", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(true); // ⚠️ chỉ nên true nếu bạn deploy HTTPS (local dev thì false)
            cookie.setPath("/");
            cookie.setMaxAge((int) maxAge);
            cookie.setAttribute("SameSite", "None"); // 👈 bắt buộc nếu bạn gửi cookie cross-origin (FE khác domain)
            response.addCookie(cookie);


            // ✅ Trả về user info + token
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "user", Map.of(
                            "id", user.getId(),
                            "email", user.getEmail(),
                            "name", user.getName(),
                            "avatar", user.getAvatar(),
                            "role", user.getRole().getName()
                    )
            ));
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

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("success", false, "error", "Not authenticated"));
        }
        User user = (User) authentication.getPrincipal();
        // Nếu passwordChangedAt là null, trả về 0
        Object passwordChangedValue = user.getPasswordChangedAt() == null ? 0 : user.getPasswordChangedAt();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "user", user,
                "passwordChangedAt", passwordChangedValue
        ));
    }
    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody GoogleLoginRequestDTO request, HttpServletResponse response) {
        try {
            String idTokenString = request.getIdToken();

            // ✅ Xác thực token Google
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                return ResponseEntity.status(401).body(Map.of("success", false, "error", "INVALID_GOOGLE_TOKEN"));
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            // ✅ Nếu chưa có user → tạo mới
            User user = userService.findByEmail(email).orElse(null);
            if (user == null) {
                Role userRole = roleService.findByName("USER")
                        .orElseGet(() -> roleService.save(new Role(null, "USER")));

                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setAvatar(picture);
                user.setStatus(true);
                user.setRole(userRole);
                user.setVerified(true);
                userService.save(user);
            } else {
                // ✅ Cập nhật thông tin nếu cần
                if (user.getAvatar() == null || user.getAvatar().isEmpty()) {
                    user.setAvatar(picture);
                }
                if (!Boolean.TRUE.equals(user.getVerified())) {
                    user.setVerified(true);
                }
                userService.save(user);
            }

            if (!Boolean.TRUE.equals(user.getStatus())) {
                return ResponseEntity.status(403).body(Map.of(
                        "success", false,
                        "error", "ACCOUNT_DISABLED"
                ));
            }

            // ✅ Tạo JWT + cookie + response đồng nhất với login thường
            long maxAge = 3600;
            String token = jwtService.generateToken(user);
            ResponseCookie cookie = ResponseCookie.from("jwt", token)
                    .httpOnly(true)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(maxAge)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "user", Map.of(
                            "id", user.getId(),
                            "email", user.getEmail(),
                            "name", user.getName(),
                            "avatar", user.getAvatar(),
                            "role", user.getRole().getName()
                    )
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "error", "SERVER_ERROR"));
        }
    }
}