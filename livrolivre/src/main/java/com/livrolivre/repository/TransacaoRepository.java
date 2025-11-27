package com.livrolivre.repository;

import com.livrolivre.model.Transacao;
import com.livrolivre.model.Usuario;
import com.livrolivre.model.enums.StatusTransacao;
import com.livrolivre.model.enums.TipoTransacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    @Query("SELECT t FROM Transacao t WHERE t.solicitante.id = :usuarioId OR t.proprietario.id = :usuarioId ORDER BY t.data DESC")
    List<Transacao> findHistoricoCompleto(@Param("usuarioId") Long usuarioId);

    @Query("SELECT t FROM Transacao t WHERE t.proprietario = :proprietario AND t.tipo = :tipo AND t.status = :status ORDER BY t.data DESC")
    List<Transacao> buscarOfertasRecebidas(
            @Param("proprietario") Usuario proprietario, // <--- ADICIONE @Param
            @Param("tipo") TipoTransacao tipo,         // <--- ADICIONE @Param
            @Param("status") StatusTransacao status     // <--- ADICIONE @Param
    );
}