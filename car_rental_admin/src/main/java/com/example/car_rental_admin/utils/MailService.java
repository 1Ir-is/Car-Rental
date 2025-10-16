package com.example.car_rental_admin.utils;

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

    private String fromEmail = "autorentdanang@gmail.com";
    private String fromName = "AutoRent Da Nang";

    // Existing owner application mails (kept)
    public void sendApprovedMail(String to, String userName, String appUrl)
            throws MessagingException, UnsupportedEncodingException {
        sendMailTemplate(to, "Your Owner Application Approved",
                "email-templates/owner-application-approved.html", userName, appUrl);
    }

    public void sendRejectedMail(String to, String userName, String appUrl)
            throws MessagingException, UnsupportedEncodingException {
        sendMailTemplate(to, "Your Owner Application Rejected",
                "email-templates/owner-application-rejected.html", userName, appUrl);
    }

    public void sendRevokedMail(String to, String userName, String appUrl)
            throws MessagingException, UnsupportedEncodingException {
        sendMailTemplate(to, "Your Owner Privileges Revoked",
                "email-templates/owner-application-revoked.html", userName, appUrl);
    }

    // --- New: Vehicle status emails ---

    public void sendVehicleApprovedMail(String to, String userName, String vehicleName, String appUrl)
            throws MessagingException, UnsupportedEncodingException {
        String subject = "Your vehicle has been approved: " + vehicleName;
        sendMailTemplateWithVehicle(to, subject, "email-templates/vehicle-approved.html",
                userName, vehicleName, null, appUrl);
    }

    public void sendVehicleRejectedMail(String to, String userName, String vehicleName, String reason, String appUrl)
            throws MessagingException, UnsupportedEncodingException {
        String subject = "Your vehicle has been rejected: " + vehicleName;
        sendMailTemplateWithVehicle(to, subject, "email-templates/vehicle-rejected.html",
                userName, vehicleName, reason, appUrl);
    }

    public void sendVehicleUnavailableMail(String to, String userName, String vehicleName, String reason, String appUrl)
            throws MessagingException, UnsupportedEncodingException {
        String subject = "Your vehicle has been marked unavailable: " + vehicleName;
        sendMailTemplateWithVehicle(to, subject, "email-templates/vehicle-unavailable.html",
                userName, vehicleName, reason, appUrl);
    }

    public void sendVehicleAvailableMail(String to, String userName, String vehicleName, String appUrl)
            throws MessagingException, UnsupportedEncodingException {
        String subject = "Your vehicle is now available: " + vehicleName;
        sendMailTemplateWithVehicle(to, subject, "email-templates/vehicle-available.html",
                userName, vehicleName, null, appUrl);
    }

    // Generic mail template loader (existing)
    private void sendMailTemplate(String to, String subject, String templatePath,
                                  String userName, String appUrl)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);

        String html = loadTemplate(templatePath)
                .replace("${userName}", safe(userName))
                .replace("${appUrl}", safe(appUrl))
                .replace("${year}", String.valueOf(LocalDate.now().getYear()));

        helper.setText(html, true);
        mailSender.send(message);
    }

    // New helper for vehicle templates (adds vehicleName + reason)
    private void sendMailTemplateWithVehicle(String to, String subject, String templatePath,
                                             String userName, String vehicleName, String reason, String appUrl)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);

        String html = loadTemplate(templatePath)
                .replace("${userName}", safe(userName))
                .replace("${vehicleName}", safe(vehicleName))
                .replace("${reason}", safe(reason == null ? "" : reason))
                .replace("${appUrl}", safe(appUrl))
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

    private String safe(String v) {
        return v == null ? "" : v;
    }
}