package com.example.car_rental_server.filter;

import com.example.car_rental_server.security.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Log tất cả cookie
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                System.out.println("Cookie: " + c.getName() + " = " + c.getValue());
            }
        }

        String token = null;
        // Ưu tiên lấy từ cookie "jwt"
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("jwt".equals(c.getName())) {
                    token = c.getValue();
                    break;
                }
            }
        }
        // Nếu không có, lấy từ header Authorization
        if (token == null) {
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        // Log giá trị token lấy được
        System.out.println("Token lấy được: " + token);

        // Validate và log lỗi chi tiết
        if (token != null) {
            try {
                if (jwtService.validateToken(token)) {
                    String username = jwtService.getUsernameFromToken(token);
                    UserDetails user = userDetailsService.loadUserByUsername(username);

                    System.out.println("JWT Token: " + token);
                    System.out.println("Username: " + username);
                    System.out.println("Authorities: " + user.getAuthorities());
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    System.out.println("Token không hợp lệ hoặc đã hết hạn!");
                }
            } catch (Exception e) {
                System.out.println("Lỗi validateToken: " + e.getMessage());
            }
        } else {
            System.out.println("Không tìm thấy token trong request!");
        }

        filterChain.doFilter(request, response);
    }
}