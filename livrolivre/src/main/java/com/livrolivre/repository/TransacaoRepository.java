// TransacaoRepository.java (Conteudo OBRIGATÓRIO)

package com.livrolivre.repository;

import com.livrolivre.model.Transacao;
import com.livrolivre.model.Usuario;
import com.livrolivre.model.enums.StatusTransacao;
import com.livrolivre.model.enums.TipoTransacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    // 1. HISTÓRICO COMPLETO (Visível para o solicitante - você)
    @Query("SELECT t FROM Transacao t WHERE t.solicitante.id = :usuarioId OR t.proprietario.id = :usuarioId ORDER BY t.data DESC")
    List<Transacao> findHistoricoCompleto(@Param("usuarioId") Long usuarioId);

    // 2. OFERTAS RECEBIDAS (Visível para a contraparte)
    @Query("SELECT t FROM Transacao t WHERE t.proprietario = :proprietario AND t.tipo = :tipo AND t.status = :status ORDER BY t.data DESC")
    List<Transacao> buscarOfertasRecebidas(
            @Param("proprietario") Usuario proprietario,
            @Param("tipo") TipoTransacao tipo,
            @Param("status") StatusTransacao status
    );
}