package com.livrolivre.controller;

import com.livrolivre.controller.dto.PropostaTrocaDTO;
import com.livrolivre.model.Transacao;
import com.livrolivre.model.Usuario;
import com.livrolivre.repository.UsuarioRepository;
import com.livrolivre.service.TransacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    @Autowired
    private TransacaoService transacaoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/finalizar/{livroId}")
    public ResponseEntity<Void> finalizarTransacao(@PathVariable Long livroId, Principal principal) {
    String nomeUsuario = principal.getName();
    Usuario solicitante = usuarioRepository.findByNomeUsuario(nomeUsuario)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado: " + nomeUsuario));

    try {
        transacaoService.finalizarDoacao(solicitante, livroId);
        return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().build();
    }
}

    @GetMapping("/meu-historico")
    public ResponseEntity<List<Transacao>> getMeuHistorico(Principal principal) {
        String nomeUsuario = principal.getName();
        Usuario solicitante = usuarioRepository.findByNomeUsuario(nomeUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado: " + nomeUsuario));
        List<Transacao> historico = transacaoService.buscarHistoricoPorUsuario(solicitante.getId());
        return ResponseEntity.ok(historico);
    }

    @PostMapping("/propor-troca")
    public ResponseEntity<?> proporTroca(@RequestBody PropostaTrocaDTO propostaDTO, Principal principal) {
        try {
            String nomeUsuario = principal.getName();
            Usuario solicitante = usuarioRepository.findByNomeUsuario(nomeUsuario)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado: " + nomeUsuario));
            Transacao novaProposta = transacaoService.proporTroca(
                    propostaDTO.getLivroSolicitadoId(),
                    propostaDTO.getLivroOfertadoId(),
                    solicitante);
            return ResponseEntity.ok(novaProposta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/ofertas-recebidas")
    public ResponseEntity<List<Transacao>> getOfertasRecebidas(Principal principal) {
        String nomeUsuario = principal.getName();
        Usuario proprietario = usuarioRepository.findByNomeUsuario(nomeUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado: " + nomeUsuario));
        List<Transacao> ofertas = transacaoService.buscarOfertasRecebidas(proprietario);
        return ResponseEntity.ok(ofertas);
    }

    @PostMapping("/{id}/aceitar")
    public ResponseEntity<?> aceitarTroca(@PathVariable Long id, Principal principal) {
        try {
            String nomeUsuario = principal.getName();
            Usuario usuarioLogado = usuarioRepository.findByNomeUsuario(nomeUsuario)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado"));
            Transacao transacao = transacaoService.aceitarTroca(id, usuarioLogado);
            return ResponseEntity.ok(transacao);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/recusar")
    public ResponseEntity<?> recusarTroca(@PathVariable Long id, Principal principal) {
        try {
            String nomeUsuario = principal.getName();
            Usuario usuarioLogado = usuarioRepository.findByNomeUsuario(nomeUsuario)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado"));
            Transacao transacao = transacaoService.recusarTroca(id, usuarioLogado);
            return ResponseEntity.ok(transacao);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}