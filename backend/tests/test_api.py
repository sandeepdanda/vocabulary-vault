"""Tests for API routes: words, review, books, stats, achievements, wotd."""


WORD_PAYLOAD = {
    "word": "ephemeral",
    "meaning": "lasting for a very short time",
    "synonyms": "transient, fleeting",
    "context": "The ephemeral beauty of cherry blossoms.",
    "book_name": "Test Book",
    "chapter_name": "Chapter 1",
}


class TestWords:
    def test_add_word(self, auth_client):
        resp = auth_client.post("/api/words", json=WORD_PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert data["entry"]["word"] == "ephemeral"
        assert data["xp_earned"] == 10
        assert data["new_total_xp"] >= 10
        assert isinstance(data["achievements_unlocked"], list)

    def test_add_duplicate_word(self, auth_client):
        auth_client.post("/api/words", json=WORD_PAYLOAD)
        resp = auth_client.post("/api/words", json=WORD_PAYLOAD)
        assert resp.status_code == 409

    def test_export(self, auth_client):
        auth_client.post("/api/words", json=WORD_PAYLOAD)
        resp = auth_client.get("/api/words/export")
        assert resp.status_code == 200
        data = resp.json()
        assert "entries" in data
        assert len(data["entries"]) == 1
        assert data["entries"][0]["word"] == "ephemeral"


class TestReview:
    def _add_word(self, client):
        client.post("/api/words", json=WORD_PAYLOAD)

    def test_answer_correct(self, auth_client):
        self._add_word(auth_client)
        # Get the word id
        export = auth_client.get("/api/words/export").json()
        # We need the word_id from the DB - use the add response instead
        add_resp = auth_client.post("/api/words", json={
            **WORD_PAYLOAD, "word": "ubiquitous", "meaning": "present everywhere",
            "chapter_name": "Chapter 2",
        })
        word_id = add_resp.json()["entry"]["id"]

        resp = auth_client.post("/api/review/answer", json={
            "word_id": word_id, "answer": "ubiquitous"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["correct"] is True
        assert data["new_mastery"] == 1

    def test_answer_wrong(self, auth_client):
        add_resp = auth_client.post("/api/words", json=WORD_PAYLOAD)
        word_id = add_resp.json()["entry"]["id"]

        resp = auth_client.post("/api/review/answer", json={
            "word_id": word_id, "answer": "wrong answer"
        })
        assert resp.status_code == 200
        assert resp.json()["correct"] is False

    def test_complete_review(self, auth_client):
        self._add_word(auth_client)
        resp = auth_client.post("/api/review/complete", json={
            "correct_count": 1, "total_count": 1
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["xp_earned"] == 5
        assert data["new_total_xp"] >= 15  # 10 from add + 5 from review


class TestBooks:
    def test_list_books_empty(self, auth_client):
        resp = auth_client.get("/api/books")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_books_after_add(self, auth_client):
        auth_client.post("/api/words", json=WORD_PAYLOAD)
        resp = auth_client.get("/api/books")
        assert resp.status_code == 200
        books = resp.json()
        assert len(books) == 1
        assert books[0]["name"] == "Test Book"


class TestStats:
    def test_profile(self, auth_client):
        resp = auth_client.get("/api/stats/profile")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_xp"] == 0
        assert data["reader_level"] == "Novice"
        assert data["total_words"] == 0


class TestAchievements:
    def test_list_achievements(self, auth_client):
        resp = auth_client.get("/api/achievements")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert all("key" in a and "title" in a for a in data)


class TestWotd:
    def test_wotd_empty_vault(self, auth_client):
        resp = auth_client.get("/api/wotd")
        assert resp.status_code == 200
        # Empty vault returns null
        assert resp.json() is None

    def test_wotd_with_words(self, auth_client):
        auth_client.post("/api/words", json=WORD_PAYLOAD)
        resp = auth_client.get("/api/wotd")
        assert resp.status_code == 200
        data = resp.json()
        assert data["word"] == "ephemeral"


class TestProtected:
    """All protected endpoints should return 401 without auth."""

    def test_words_401(self, client):
        assert client.post("/api/words", json=WORD_PAYLOAD).status_code == 401

    def test_books_401(self, client):
        assert client.get("/api/books").status_code == 401

    def test_stats_401(self, client):
        assert client.get("/api/stats/profile").status_code == 401

    def test_achievements_401(self, client):
        assert client.get("/api/achievements").status_code == 401

    def test_wotd_401(self, client):
        assert client.get("/api/wotd").status_code == 401

    def test_review_due_401(self, client):
        assert client.get("/api/review/due").status_code == 401

    def test_export_401(self, client):
        assert client.get("/api/words/export").status_code == 401
