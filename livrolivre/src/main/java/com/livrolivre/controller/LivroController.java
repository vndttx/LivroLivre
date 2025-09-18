package com.livrolivre.controller;

import com.livrolivre.model.Livro;
import com.livrolivre.model.Usuario;
import com.livrolivre.model.enums.StatusLivro;
import com.livrolivre.repository.UsuarioRepository;
import com.livrolivre.service.LivroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    @Autowired
    private LivroService livroService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Livro> listarTodos() {
        return livroService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Livro> buscarPorId(@PathVariable Long id) {
        Optional<Livro> livro = livroService.buscarPorId(id);
        return livro.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Livro> salvar(@RequestBody Livro livro, Principal principal) {
        String nomeUsuario = principal.getName();
        Usuario proprietario = usuarioRepository.findByNomeUsuario(nomeUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado: " + nomeUsuario));

        livro.setProprietario(proprietario);
        livro.setStatus(StatusLivro.DISPONIVEL);

        Livro livroSalvo = livroService.salvar(livro);
        return new ResponseEntity<>(livroSalvo, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        livroService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/meus-livros")
    public ResponseEntity<List<Livro>> getMeusLivros(Principal principal) {
        String nomeUsuario = principal.getName();
        Usuario proprietario = usuarioRepository.findByNomeUsuario(nomeUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado: " + nomeUsuario));

        List<Livro> meusLivros = livroService.buscarPorProprietario(proprietario);
        return ResponseEntity.ok(meusLivros);
    }
}