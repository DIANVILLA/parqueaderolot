package com.edu.sena.parqueadero_lot; // ASEGÚRATE QUE ESTE PAQUETE SEA EL TUYO

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                        "http://localhost:3000",
                        "http://127.0.0.1:3000",
                        "https://*.githubpreview.dev",
                        "https://*.app.github.dev",
                        "https://*.github.dev",
                        "https://*.vscode-cdn.net",
                        "https://*.use2.devtunnels.ms",
                        "https://*.devtunnels.ms")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
