package com.livrolivre.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.livrolivre.model.Livro;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class LivroRepository {

    private final CollectionReference collection;

    public LivroRepository(Firestore firestore) {
        this.collection = firestore.collection("livros");
    }

    public Livro save(Livro livro) throws ExecutionException, InterruptedException {
        if (livro.getId() == null || livro.getId().isEmpty()) {
            DocumentReference docRef = collection.document();
            livro.setId(docRef.getId());
        }
        collection.document(livro.getId()).set(livro).get();
        return livro;
    }

    public java.util.Optional<Livro> findById(String id) throws java.util.concurrent.ExecutionException, InterruptedException {
        DocumentSnapshot snapshot = collection.document(id).get().get();
        if (snapshot.exists()) {
            return java.util.Optional.of(snapshot.toObject(Livro.class));
        }
        return java.util.Optional.empty();
    }

    public List<Livro> findAll() throws ExecutionException, InterruptedException {
        List<Livro> livros = new ArrayList<>();
        QuerySnapshot querySnapshot = collection.get().get();
        for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
            livros.add(doc.toObject(Livro.class));
        }
        return livros;
    }
    public List<Livro> findByProprietarioId(String usuarioId) throws ExecutionException, InterruptedException {
        List<Livro> livros = new ArrayList<>();
        QuerySnapshot querySnapshot = collection.whereEqualTo("proprietario.id", usuarioId).get().get();
        for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
            livros.add(doc.toObject(Livro.class));
        }
        return livros;
    }

    public void deleteById(String id) throws java.util.concurrent.ExecutionException, InterruptedException {
        collection.document(id).delete().get();
    }

}