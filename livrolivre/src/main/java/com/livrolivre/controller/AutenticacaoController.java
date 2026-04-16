package com.livrolivre.controller;

import com.livrolivre.controller.dto.DadosTokenJWT;
import com.livrolivre.controller.dto.LoginRequest;
import com.livrolivre.security.JwtTokenUtil;
import com.livrolivre.security.LoginResponse;
import com.livrolivre.service.UsuarioService;
import com.livrolivre.repository.UsuarioRepository;
import com.livrolivre.model.Usuario;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.token.TokenService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/autenticacao")
public class AutenticacaoController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    public AutenticacaoController(
            AuthenticationManager authenticationManager,
            UsuarioService usuarioService,
            JwtTokenUtil jwtTokenUtil,
            UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.usuarioService = usuarioService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/usuarios/cadastrar")
    @Transactional
    public ResponseEntity cadastrar(@RequestBody @Valid LoginRequest dados) {
        var usuario = new Usuario(dados.getEmail(), dados.getNome(), passwordEncoder.encode(dados.getSenha()));
        usuarioRepository.save(usuario);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity efetuarLogin(@RequestBody @Valid LoginRequest dados) {
        var authenticationToken = new UsernamePasswordAuthenticationToken(dados.getEmail(), dados.getSenha());
        var authentication = authenticationManager.authenticate(authenticationToken);
        var tokenJWT = jwtTokenUtil.generateToken((Usuario) authentication.getPrincipal());
        return ResponseEntity.ok(new DadosTokenJWT(tokenJWT));
    }


}