package com.livrolivre.repository;

import com.google.cloud.firestore.*;
import com.livrolivre.model.Transacao;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class TransacaoRepository {

    private final CollectionReference collection;

    public TransacaoRepository(Firestore firestore) {
        this.collection = firestore.collection("transacoes");
    }

    public Transacao save(Transacao transacao) throws ExecutionException, InterruptedException {
        if (transacao.getId() == null || transacao.getId().isEmpty()) {
            DocumentReference docRef = collection.document();
            transacao.setId(docRef.getId());
        }
        collection.document(transacao.getId()).set(transacao).get();
        return transacao;
    }

    public Optional<Transacao> findById(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot snapshot = collection.document(id).get().get();
        if (snapshot.exists()) {
            return Optional.of(snapshot.toObject(Transacao.class));
        }
        return Optional.empty();
    }

    public List<Transacao> findByDestinatarioId(String usuarioId) throws ExecutionException, InterruptedException {
        List<Transacao> transacoes = new ArrayList<>();
        QuerySnapshot querySnapshot = collection.whereEqualTo("destinatario.id", usuarioId).get().get();
        for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
            transacoes.add(doc.toObject(Transacao.class));
        }
        return transacoes;
    }
}