package com.livrolivre.controller;

import com.livrolivre.controller.dto.PropostaTrocaDTO;
import com.livrolivre.model.Transacao;
import com.livrolivre.model.Usuario;
import com.livrolivre.repository.UsuarioRepository;
import com.livrolivre.service.TransacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

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
    public ResponseEntity<Transacao> finalizarDoacao(@PathVariable Long livroId, Principal principal) {
        Usuario solicitante = getUsuarioLogado(principal);
        Transacao transacao = transacaoService.finalizarDoacao(solicitante, livroId);
        return ResponseEntity.ok(transacao);
    }

    @GetMapping("/historico")
    public ResponseEntity<List<Transacao>> buscarHistorico(Principal principal) {
        Usuario usuario = getUsuarioLogado(principal);
        List<Transacao> historico = transacaoService.buscarHistoricoPorUsuario(usuario.getId());
        return ResponseEntity.ok(historico);
    }

    @PostMapping("/propor-troca")
    public ResponseEntity<Transacao> proporTroca(@RequestBody PropostaTrocaDTO proposta, Principal principal) {
        Usuario solicitante = getUsuarioLogado(principal);
        Transacao transacao = transacaoService.proporTroca(
                proposta.getLivroSolicitadoId(),
                proposta.getLivroOfertadoId(),
                solicitante
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(transacao);
    }

    @GetMapping("/ofertas-recebidas")
    public ResponseEntity<List<Transacao>> buscarOfertasRecebidas(Principal principal) {
        Usuario proprietario = getUsuarioLogado(principal);
        List<Transacao> ofertas = transacaoService.buscarOfertasRecebidas(proprietario);
        return ResponseEntity.ok(ofertas);
    }

    @PostMapping("/{id}/aceitar")
    public ResponseEntity<Transacao> aceitarTroca(@PathVariable Long id, Principal principal) {
        Usuario usuario = getUsuarioLogado(principal);
        Transacao transacao = transacaoService.aceitarTroca(id, usuario);
        return ResponseEntity.ok(transacao);
    }

    @PostMapping("/{id}/recusar")
    public ResponseEntity<Transacao> recusarTroca(@PathVariable Long id, Principal principal) {
        Usuario usuario = getUsuarioLogado(principal);
        Transacao transacao = transacaoService.recusarTroca(id, usuario);
        return ResponseEntity.ok(transacao);
    }

    private Usuario getUsuarioLogado(Principal principal) {
        return usuarioRepository.findByNomeUsuario(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado"));
    }
}