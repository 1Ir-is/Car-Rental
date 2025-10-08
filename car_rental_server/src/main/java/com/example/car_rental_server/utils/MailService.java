package com.example.car_rental_server.utils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Scanner;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    // Gửi mail cho user khi nộp đơn
    public void sendOwnerApplicationPendingHtmlMail(String to, String userName, String appUrl)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
        helper.setFrom("autorentdanang@gmail.com", "AutoRent Da Nang");
        helper.setTo(to);
        helper.setSubject("Your Owner Application is Pending Review");

        String html = loadTemplate("email-templates/owner-application-pending.html")
                .replace("${userName}", userName)
                .replace("${appUrl}", appUrl)
                .replace("${year}", String.valueOf(LocalDate.now().getYear()));

        helper.setText(html, true);

        mailSender.send(message);
    }

    // Gửi mail cho admin khi có đơn mới
    public void sendOwnerApplicationNotificationToAdmin(String adminEmail, String userName, String userEmail, String appUrl)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
        helper.setFrom("autorentdanang@gmail.com", "AutoRent Da Nang");
        helper.setTo(adminEmail);
        helper.setSubject("New Owner Application Submitted");

        String html = loadTemplate("email-templates/admin-owner-application-notify.html")
                .replace("${userName}", userName)
                .replace("${userEmail}", userEmail)
                .replace("${appUrl}", appUrl)
                .replace("${year}", String.valueOf(LocalDate.now().getYear()));

        helper.setText(html, true);

        mailSender.send(message);
    }

    public void sendOtpEmail(String to, String userName, String otp)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
        helper.setFrom("autorentdanang@gmail.com", "AutoRent Da Nang");
        helper.setTo(to);
        helper.setSubject("Your Email Verification Code");
        String html = loadTemplate("email-templates/verify-email-otp.html")
                .replace("${userName}", userName)
                .replace("${otp}", otp)
                .replace("${year}", String.valueOf(LocalDate.now().getYear()));
        helper.setText(html, true);
        mailSender.send(message);
    }

    private String loadTemplate(String path) {
        try (Scanner scanner = new Scanner(new ClassPathResource(path).getInputStream(), StandardCharsets.UTF_8.name())) {
            return scanner.useDelimiter("\\A").next();
        } catch (Exception e) {
            throw new RuntimeException("Cannot load mail template: " + path, e);
        }
    }
}