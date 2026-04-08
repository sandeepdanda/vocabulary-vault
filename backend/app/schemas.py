"""Pydantic request/response models for all API endpoints."""

from __future__ import annotations

from pydantic import BaseModel


# --- Auth ---

class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    message: str
    username: str


# --- Words ---

class WordCreateRequest(BaseModel):
    word: str
    meaning: str
    synonyms: str = ""
    context: str = ""
    book_name: str
    chapter_name: str


class WordResponse(BaseModel):
    id: int
    word: str
    meaning: str
    synonyms: str
    context: str
    book_name: str
    chapter_name: str
    date_added: str
    mastery_level: int


class AddWordResponse(BaseModel):
    entry: WordResponse
    xp_earned: int
    new_total_xp: int
    level_up: str | None = None
    streak: int
    achievements_unlocked: list[AchievementResponse] = []


# --- Review ---

class ReviewAnswerRequest(BaseModel):
    word_id: int
    answer: str


class ReviewAnswerResponse(BaseModel):
    correct: bool
    correct_word: str
    new_mastery: int
    next_review: str


class ReviewSessionSummary(BaseModel):
    correct_count: int
    total_count: int
    xp_earned: int
    new_total_xp: int
    level_up: str | None = None
    streak: int
    achievements_unlocked: list[AchievementResponse] = []


# --- Profile ---

class ProfileResponse(BaseModel):
    total_xp: int
    reader_level: str
    current_streak: int
    longest_streak: int
    total_words: int
    total_books: int
    next_level_name: str | None = None
    xp_to_next_level: int
    current_level_threshold: int
    next_level_threshold: int | None = None


# --- Achievements ---

class AchievementResponse(BaseModel):
    key: str
    emoji: str
    title: str
    description: str
    earned: bool
    earned_at: str | None = None


# --- WOTD ---

class WotdResponse(BaseModel):
    word: str
    meaning: str
    synonyms: str
    context: str
    book_name: str
    chapter_name: str


# --- Books ---

class ChapterResponse(BaseModel):
    name: str
    chapter_number: int
    word_count: int
    earliest_entry: str | None = None
    latest_entry: str | None = None


class BookListItem(BaseModel):
    name: str
    chapter_count: int
    word_count: int


class BookDetailResponse(BaseModel):
    name: str
    word_count: int
    chapter_count: int
    chapters: list[ChapterResponse]


# Fix forward references for AddWordResponse and ReviewSessionSummary
AddWordResponse.model_rebuild()
ReviewSessionSummary.model_rebuild()
