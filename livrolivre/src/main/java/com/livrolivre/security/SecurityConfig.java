package com.livrolivre.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
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
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize

                        // 1. ROTAS PÚBLICAS (Login, Cadastro de Usuário e Leitura do Catálogo)
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/autenticacao/login",
                                "/api/usuarios"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/livros/**").permitAll() // CATÁLOGO PÚBLICO CORRIGIDO

                        // 2. ARQUIVOS ESTÁTICOS (HTML, CSS, JS)
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/login.html",
                                "/cadastroUsuario.html",
                                "/cadastroLivro.html",
                                "/catalogo.html",
                                "/carrinho.html",
                                "/dashboard.html",
                                "/historico.html",
                                "/ofertas.html",
                                "/css/**",
                                "/js/**"
                        ).permitAll()

                        // 3. ROTAS AUTENTICADAS (Escrita e Transações)

                        // POST/DELETE/GET para CARRINHO (Adicionar/Remover/Ver)
                        .requestMatchers("/api/carrinho/**").authenticated()

                        // POST/GET/DELETE para LIVROS (Cadastrar/Remover Catálogo Próprio)
                        .requestMatchers(HttpMethod.POST, "/api/livros").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/livros/**").authenticated()

                        // POST/GET para TRANSAÇÕES (Pedir Doação, Propor Troca, Ver Histórico)
                        .requestMatchers(HttpMethod.POST, "/api/transacoes/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/transacoes/**").authenticated()

                        // 4. Qualquer outra requisição exige autenticação
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}