package com.example.car_rental_server.config;

import com.example.car_rental_server.filter.JwtAuthenticationFilter;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/ws-notify/**")
                        .disable()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // allow websocket and auth endpoints
                        .requestMatchers("/ws-notify/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // Vehicles read endpoints (public)
                        .requestMatchers(HttpMethod.GET, "/api/vehicles").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vehicles/*").permitAll()
                        // Reviews: allow GET (list & summary) to public, require auth for POST
                        .requestMatchers(HttpMethod.GET, "/api/vehicles/{vehicleId}/reviews").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vehicles/{vehicleId}/reviews/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/vehicles/{vehicleId}/reviews").hasAnyAuthority("USER", "OWNER", "ADMIN")


                        // Replies: allow anyone to GET replies for a review, but only authenticated users can POST replies
                        .requestMatchers(HttpMethod.GET, "/api/reviews/{reviewId}/replies").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/{reviewId}/replies/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/reviews/{reviewId}/replies").hasAnyAuthority("USER", "OWNER", "ADMIN")

                        // Notifications (keep current policy)
                        .requestMatchers("/api/notifications/**").permitAll()

                        // ==== FOLLOW VEHICLES ====

                        .requestMatchers(HttpMethod.GET, "/api/vehicles/follow/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/vehicles/follow/**").hasAnyAuthority("USER", "OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/vehicles/follow/**").hasAnyAuthority("USER", "OWNER", "ADMIN")

                        // Admin/owner/user specific endpoints
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/owner/**").hasAuthority("OWNER")
                        .requestMatchers("/api/user/**").hasAnyAuthority("USER", "OWNER", "ADMIN")

                        // anything else requires authentication
                        .anyRequest().authenticated()
                )
                .exceptionHandling(e -> e.authenticationEntryPoint(jwtAuthEntryPoint))
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((req, resp, auth) -> {
                            Cookie cookie = new Cookie("jwt", "");
                            cookie.setMaxAge(0);
                            cookie.setHttpOnly(true);
                            cookie.setPath("/");
                            resp.addCookie(cookie);
                            resp.setStatus(HttpServletResponse.SC_OK);
                        })
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                frontendUrl,
                "http://localhost:3000",
                "http://localhost:8081"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}