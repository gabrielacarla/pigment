package com.pigment.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "paletas")
public class Paleta {

    @Id
    private String id;

    private String nome;
    private String descricao;
    private List<String> cores;

    public Paleta() {
    }

    public Paleta(String nome, String descricao, List<String> cores) {
        this.nome = nome;
        this.descricao = descricao;
        this.cores = cores;
    }

    public String getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public List<String> getCores() {
        return cores;
    }

    public void setCores(List<String> cores) {
        this.cores = cores;
    }
}