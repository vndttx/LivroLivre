package com.livrolivre.controller;

import com.livrolivre.model.Transacao;
import com.livrolivre.service.TransacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    @Autowired
    private TransacaoService transacaoService;

    @PostMapping
    public ResponseEntity<Transacao> proporTroca(@RequestBody Transacao transacao) {
        return ResponseEntity.ok(transacaoService.salvarProposta(transacao));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transacao> buscarTransacao(@PathVariable String id) {
        return transacaoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Transacao>> buscarPorUsuario(@PathVariable String usuarioId) {
        try {
            return ResponseEntity.ok(transacaoService.buscarPorUsuarioDestinatario(usuarioId));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erro ao buscar transações.", e);
        }
    }

    @GetMapping("/usuario/{usuarioId}/historico")
    public ResponseEntity<List<Transacao>> buscarHistoricoUsuario(@PathVariable String usuarioId) {
        try {
            return ResponseEntity.ok(transacaoService.buscarHistoricoPorUsuario(usuarioId));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erro ao buscar histórico do usuário.", e);
        }
    }

    @PutMapping("/{id}/aceitar")
    public ResponseEntity<Transacao> aceitarTransacao(@PathVariable String id) {
        try {
            return ResponseEntity.ok(transacaoService.aceitarTransacao(id));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erro ao aceitar transação.", e);
        }
    }

    @PutMapping("/{id}/recusar")
    public ResponseEntity<Transacao> recusarTransacao(@PathVariable String id) {
        try {
            return ResponseEntity.ok(transacaoService.recusarTransacao(id));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erro ao recusar transação.", e);
        }
    }
}