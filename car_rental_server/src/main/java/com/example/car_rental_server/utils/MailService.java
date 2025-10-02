package com.example.car_rental_server.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Scanner;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    public void sendOwnerApplicationPendingHtmlMail(String to, String userName, String appUrl) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
        // Đặt địa chỉ gửi và tên hiển thị
        helper.setFrom("autorentdanang@gmail.com", "AutoRent Da Nang");
        helper.setTo(to);
        helper.setSubject("Your Owner Application is Pending Review");

        // Đọc nội dung template HTML từ file:
        String html = loadTemplate("email-templates/owner-application-pending.html")
                .replace("${userName}", userName)
                .replace("${appUrl}", appUrl)
                .replace("${year}", String.valueOf(LocalDate.now().getYear()));

        helper.setText(html, true); // true: gửi HTML

        mailSender.send(message);
    }

    // Đọc file template trong resources
    private String loadTemplate(String path) {
        try (Scanner scanner = new Scanner(new ClassPathResource(path).getInputStream(), StandardCharsets.UTF_8.name())) {
            return scanner.useDelimiter("\\A").next();
        } catch (Exception e) {
            throw new RuntimeException("Cannot load mail template: " + path, e);
        }
    }
}