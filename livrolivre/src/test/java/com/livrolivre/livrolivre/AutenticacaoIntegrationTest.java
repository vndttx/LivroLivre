package com.livrolivre.livrolivre;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.livrolivre.controller.dto.LoginRequest;
import com.livrolivre.model.Usuario;
import com.livrolivre.repository.CarrinhoRepository;
import com.livrolivre.repository.LivroRepository;
import com.livrolivre.repository.TransacaoRepository;
import com.livrolivre.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AutenticacaoIntegrationTest {

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private CarrinhoRepository carrinhoRepository;

    @Autowired
    private LivroRepository livroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        transacaoRepository.deleteAllInBatch();
        carrinhoRepository.deleteAllInBatch();
        livroRepository.deleteAllInBatch();
        usuarioRepository.deleteAllInBatch();

        Usuario usuario = new Usuario();
        usuario.setNomeUsuario("Emanuel Pajeu");
        usuario.setEmail("emanuel@teste.com");
        usuario.setSenha(passwordEncoder.encode("123456"));
        usuarioRepository.save(usuario);
    }

    @Test
    public void deveRealizarLoginComEmail() throws Exception {
        var loginRequest = new LoginRequest("emanuel@teste.com", "123456", "Emanuel Pajeu");

        mockMvc.perform(post("/api/autenticacao/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists()); // Ajustado para bater com seu DTO DadosTokenJWT
    }
}