package com.livrolivre.controller;

import com.livrolivre.model.Usuario; // Importar o modelo Usuario
import com.livrolivre.security.JwtTokenUtil;
import com.livrolivre.security.LoginResponse; // Importar a nova classe de resposta
import com.livrolivre.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException; // Importar
import org.springframework.http.HttpStatus; // Importar

import java.util.Collections;
import java.util.Map;

@RestController
public class AutenticacaoController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @PostMapping("/api/autenticacao/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.get("nomeUsuario"), loginRequest.get("senha"))
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            Usuario usuario = usuarioService.buscarPorNomeUsuario(userDetails.getUsername())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

            String token = jwtTokenUtil.generateToken(userDetails);

            return ResponseEntity.ok(new LoginResponse(token, usuario.getId(), usuario.getNomeUsuario()));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Credenciais inválidas."));
        }
    }
}