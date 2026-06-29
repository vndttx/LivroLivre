package com.livrolivre.repository;

import com.google.cloud.firestore.*;
import com.livrolivre.model.Transacao;
import com.livrolivre.model.Usuario;
import com.livrolivre.model.Livro;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class TransacaoRepository {

    private final CollectionReference collection;
    private final Firestore firestore;

    public TransacaoRepository(Firestore firestore) {
        this.firestore = firestore;
        this.collection = firestore.collection("transacoes");
    }

    private void complementarDados(Transacao transacao) {
        if (transacao == null) return;

        try {
            if (transacao.getSolicitante() != null && transacao.getSolicitante().getId() != null) {
                DocumentSnapshot userDoc = firestore.collection("usuarios").document(transacao.getSolicitante().getId()).get().get();
                if (userDoc.exists()) {
                    Usuario completo = userDoc.toObject(Usuario.class);
                    if (completo != null) transacao.setSolicitante(completo);
                }
            }

            if (transacao.getDestinatario() == null && transacao.getProprietario() != null) {
                transacao.setDestinatario(transacao.getProprietario());
            } else if (transacao.getProprietario() == null && transacao.getDestinatario() != null) {
                transacao.setProprietario(transacao.getDestinatario());
            }

            if (transacao.getDestinatario() != null && transacao.getDestinatario().getId() != null) {
                DocumentSnapshot destDoc = firestore.collection("usuarios").document(transacao.getDestinatario().getId()).get().get();
                if (destDoc.exists()) {
                    Usuario completo = destDoc.toObject(Usuario.class);
                    if (completo != null) {
                        transacao.setDestinatario(completo);
                        transacao.setProprietario(completo);
                    }
                }
            }

            if (transacao.getLivroSolicitado() != null && transacao.getLivroSolicitado().getId() != null) {
                DocumentSnapshot livroDoc = firestore.collection("livros").document(transacao.getLivroSolicitado().getId()).get().get();
                if (livroDoc.exists()) {
                    Livro completo = livroDoc.toObject(Livro.class);
                    if (completo != null) transacao.setLivroSolicitado(completo);
                }
            }

            if (transacao.getLivroOfertado() != null && transacao.getLivroOfertado().getId() != null) {
                DocumentSnapshot livroOfDoc = firestore.collection("livros").document(transacao.getLivroOfertado().getId()).get().get();
                if (livroOfDoc.exists()) {
                    Livro completo = livroOfDoc.toObject(Livro.class);
                    if (completo != null) transacao.setLivroOfertado(completo);
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao complementar dados da transação: " + e.getMessage());
        }
    }

    public Transacao save(Transacao transacao) throws ExecutionException, InterruptedException {
        if (transacao.getId() == null || transacao.getId().isEmpty()) {
            DocumentReference docRef = collection.document();
            transacao.setId(docRef.getId());
        }

        if (transacao.getDestinatario() == null && transacao.getProprietario() != null) {
            transacao.setDestinatario(transacao.getProprietario());
        } else if (transacao.getProprietario() == null && transacao.getDestinatario() != null) {
            transacao.setProprietario(transacao.getDestinatario());
        }

        collection.document(transacao.getId()).set(transacao).get();
        return transacao;
    }

    public Optional<Transacao> findById(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot snapshot = collection.document(id).get().get();
        if (snapshot.exists()) {
            Transacao transacao = snapshot.toObject(Transacao.class);
            complementarDados(transacao);
            return Optional.ofNullable(transacao);
        }
        return Optional.empty();
    }

    public List<Transacao> findByDestinatarioId(String usuarioId) throws ExecutionException, InterruptedException {
        List<Transacao> transacoes = new ArrayList<>();
        QuerySnapshot querySnapshot = collection.whereEqualTo("destinatario.id", usuarioId).get().get();

        if (querySnapshot.isEmpty()) {
            querySnapshot = collection.whereEqualTo("proprietario.id", usuarioId).get().get();
        }

        for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
            Transacao t = doc.toObject(Transacao.class);
            complementarDados(t);
            transacoes.add(t);
        }
        return transacoes;
    }

    public List<Transacao> findBySolicitanteId(String usuarioId) throws ExecutionException, InterruptedException {
        List<Transacao> transacoes = new ArrayList<>();
        QuerySnapshot querySnapshot = collection.whereEqualTo("solicitante.id", usuarioId).get().get();
        for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
            Transacao t = doc.toObject(Transacao.class);
            complementarDados(t);
            transacoes.add(t);
        }
        return transacoes;
    }
}