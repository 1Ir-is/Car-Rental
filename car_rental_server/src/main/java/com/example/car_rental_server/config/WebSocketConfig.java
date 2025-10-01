package com.example.car_rental_server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;


@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // Đường dẫn gửi về client
        config.setApplicationDestinationPrefixes("/app"); // Đường dẫn client gửi lên server
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Cho phép cả admin server và user server kết nối
        registry.addEndpoint("/ws-notify")
                .setAllowedOriginPatterns("*") // chỉnh lại domain thật khi deploy
                .withSockJS(); // fallback cho browser cũ
    }
}