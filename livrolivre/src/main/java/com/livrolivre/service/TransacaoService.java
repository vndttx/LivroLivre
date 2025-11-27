package com.livrolivre.service;

import com.livrolivre.model.Livro;
import com.livrolivre.model.Transacao;
import com.livrolivre.model.Usuario;
import com.livrolivre.model.enums.StatusLivro;
import com.livrolivre.model.enums.StatusTransacao;
import com.livrolivre.model.enums.TipoTransacao;
import com.livrolivre.repository.CarrinhoRepository;
import com.livrolivre.repository.LivroRepository;
import com.livrolivre.repository.TransacaoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransacaoService {

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private CarrinhoRepository carrinhoRepository;

    @Autowired
    private LivroRepository livroRepository;

    @Transactional
    public void finalizarDoacao(Usuario solicitante, Long livroId) {
        Livro livroDoado = livroRepository.findById(livroId)
                .orElseThrow(() -> new IllegalArgumentException("Livro para doacao nao encontrado"));

        if (livroDoado.getStatus() != StatusLivro.DISPONIVEL) {
            throw new IllegalStateException("Este livro nao esta disponivel para doacao.");
        }

        Transacao transacao = new Transacao();
        transacao.setSolicitante(solicitante);
        transacao.setProprietario(livroDoado.getProprietario());
        transacao.setLivroSolicitado(livroDoado);
        transacao.setTipo(TipoTransacao.DOACAO);
        transacao.setStatus(StatusTransacao.CONCLUIDA);
        transacao.setData(LocalDateTime.now());
        transacaoRepository.save(transacao);

        livroDoado.setStatus(StatusLivro.INDISPONIVEL);
        livroDoado.setEstoque(0);
        livroRepository.save(livroDoado);

        carrinhoRepository.deleteByUsuarioAndLivro(solicitante, livroDoado);
    }

    public List<Transacao> buscarHistoricoPorUsuario(Long usuarioId) {
    return transacaoRepository.findHistoricoCompleto(usuarioId);
}

    @Transactional
    public Transacao proporTroca(Long livroSolicitadoId, Long livroOfertadoId, Usuario solicitante) {
        Livro livroSolicitado = livroRepository.findById(livroSolicitadoId)
                .orElseThrow(() -> new IllegalArgumentException("Livro solicitado nao encontrado"));
        Livro livroOfertado = livroRepository.findById(livroOfertadoId)
                .orElseThrow(() -> new IllegalArgumentException("Livro ofertado nao encontrado"));

        if (livroSolicitado.getStatus() != StatusLivro.DISPONIVEL || livroOfertado.getStatus() != StatusLivro.DISPONIVEL) {
            throw new IllegalStateException("Um ou ambos os livros nao estao disponiveis para troca.");
        }

        if (!livroOfertado.getProprietario().equals(solicitante)) {
            throw new IllegalStateException("Voce so pode ofertar livros que lhe pertencem.");
        }

        if (solicitante.equals(livroSolicitado.getProprietario())) {
            throw new IllegalStateException("Voce nao pode trocar um livro com voce mesmo.");
        }

        livroSolicitado.setStatus(StatusLivro.TRANSACAO_PENDENTE);
        livroOfertado.setStatus(StatusLivro.TRANSACAO_PENDENTE);
        livroRepository.save(livroSolicitado);
        livroRepository.save(livroOfertado);

        Transacao transacao = new Transacao();
        transacao.setSolicitante(solicitante);
        transacao.setProprietario(livroSolicitado.getProprietario());
        transacao.setLivroSolicitado(livroSolicitado);
        transacao.setLivroOfertado(livroOfertado);
        transacao.setTipo(TipoTransacao.TROCA);
        transacao.setStatus(StatusTransacao.PENDENTE);
        transacao.setData(LocalDateTime.now());

        return transacaoRepository.save(transacao);
    }

    public List<Transacao> buscarOfertasRecebidas(Usuario proprietario) {
    return transacaoRepository.buscarOfertasRecebidas(
            proprietario,
            TipoTransacao.TROCA,
            StatusTransacao.PENDENTE // Mantem o status pendente para ofertas
    );
}

    @Transactional
    public Transacao aceitarTroca(Long transacaoId, Usuario usuarioLogado) {
        Transacao transacao = transacaoRepository.findById(transacaoId)
                .orElseThrow(() -> new EntityNotFoundException("Transacao nao encontrada"));

        if (!transacao.getProprietario().equals(usuarioLogado)) {
            throw new IllegalStateException("Voce nao tem permissao para aceitar esta troca.");
        }
        if (transacao.getStatus() != StatusTransacao.PENDENTE) {
            throw new IllegalStateException("Esta transacao nao esta mais pendente.");
        }

        Livro livroSolicitado = transacao.getLivroSolicitado();
        Livro livroOfertado = transacao.getLivroOfertado();

        Usuario solicitante = transacao.getSolicitante();
        Usuario proprietario = transacao.getProprietario();

        livroSolicitado.setProprietario(solicitante);
        livroOfertado.setProprietario(proprietario);

        livroSolicitado.setStatus(StatusLivro.DISPONIVEL);
        livroOfertado.setStatus(StatusLivro.DISPONIVEL);

        livroRepository.save(livroSolicitado);
        livroRepository.save(livroOfertado);

        transacao.setStatus(StatusTransacao.CONCLUIDA);
        return transacaoRepository.save(transacao);
    }

    @Transactional
    public Transacao recusarTroca(Long transacaoId, Usuario usuarioLogado) {
        Transacao transacao = transacaoRepository.findById(transacaoId)
                .orElseThrow(() -> new EntityNotFoundException("Transacao nao encontrada"));

        if (!transacao.getProprietario().equals(usuarioLogado)) {
            throw new IllegalStateException("Voce nao tem permissao para recusar esta troca.");
        }
        if (transacao.getStatus() != StatusTransacao.PENDENTE) {
            throw new IllegalStateException("Esta transacao nao esta mais pendente.");
        }

        Livro livroSolicitado = transacao.getLivroSolicitado();
        Livro livroOfertado = transacao.getLivroOfertado();

        livroSolicitado.setStatus(StatusLivro.DISPONIVEL);
        livroOfertado.setStatus(StatusLivro.DISPONIVEL);

        livroRepository.save(livroSolicitado);
        livroRepository.save(livroOfertado);

        transacao.setStatus(StatusTransacao.CANCELADA);
        return transacaoRepository.save(transacao);
    }
}