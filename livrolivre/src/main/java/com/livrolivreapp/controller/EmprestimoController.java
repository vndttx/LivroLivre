package com.livrolivreapp.controller;

import com.livrolivreapp.model.Emprestimo;
import com.livrolivreapp.service.EmprestimoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carrinho")
public class EmprestimoController {

    @Autowired
    private EmprestimoService emprestimoService;

    @PostMapping("/{usuarioId}/adicionar/{livroId}")
    public ResponseEntity<Emprestimo> adicionarAoCarrinho(@PathVariable Long usuarioId, @PathVariable Long livroId) {
        return emprestimoService.adicionarLivro(usuarioId, livroId, 1)
                .map(emprestimo -> ResponseEntity.ok().body(emprestimo))
                .orElse(ResponseEntity.badRequest().build());
    }

    @GetMapping("/{usuarioId}")
    public List<Emprestimo> listarCarrinho(@PathVariable Long usuarioId) {
        return emprestimoService.listarPorUsuario(usuarioId);
    }

    @DeleteMapping("/{emprestimoId}")
    public ResponseEntity<Void> removerDoCarrinho(@PathVariable Long emprestimoId) {
        emprestimoService.removerDoCarrinho(emprestimoId);
        return ResponseEntity.noContent().build();
    }
}