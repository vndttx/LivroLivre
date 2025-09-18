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
    public ResponseEntity<?> finalizarTransacao(@PathVariable Long livroId, Principal principal) {
        String nomeUsuario = principal.getName();
        Usuario solicitante = usuarioRepository.findByNomeUsuario(nomeUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado: " + nomeUsuario));
        try {
            Transacao novaTransacao = transacaoService.finalizarDoacao(solicitante, livroId);
            return ResponseEntity.ok(novaTransacao);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/meu-historico")
    public ResponseEntity<List<Transacao>> getMeuHistorico(Principal principal) {
        String nomeUsuario = principal.getName();
        Usuario solicitante = usuarioRepository.findByNomeUsuario(nomeUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado: " + nomeUsuario));
        List<Transacao> historico = transacaoService.buscarHistoricoPorUsuario(solicitante);
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
}