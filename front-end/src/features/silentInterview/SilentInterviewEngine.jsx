import React, { useEffect } from 'react';
import { STORAGE_KEYS, LANGUAGE_STORAGE_KEY } from "../../constants/storageKeys";
import { readStoredValue, writeStoredValue, hydrateRuntimeStore, getBackendCollection } from "../../services/runtimeStore";
import { createId } from "../../utils/ids";
import { average as calculateAverage, clamp as clampNumber } from "../../utils/numbers";
import { LegacyMarkup } from "../../components/legacy/LegacyMarkup";
import { requestInterviewMedia, stopMediaStream, supportsCameraAccess } from "../../services/mediaService";
import { getSpeechRecognitionConstructor, speechLanguageFor } from "../../services/speechRecognitionService";
import { createInterviewDraft } from "../../services/interviewDraftService";
import { applyDomTranslations, translate } from "../../services/translationService";
import { findAuthenticatedUser, login, logout, register } from "../../services/authenticationService";
import { jobApi } from "../../api/jobApi";
import { candidateApi } from "../../api/candidateApi";
import { interviewApi } from "../../api/interviewApi";
import { openaiApi } from "../../api/openaiApi";
import Chart from "chart.js/auto";

const SilentInterview = () => {
    useEffect(() => {
        // Tailwind, Chart.js and fonts are loaded once by the application shell.
        // Keeping initialization free of dependency injection prevents FOUC.

        const initApp = () => {
            // ===== CONFIGURATION =====
            const LS = STORAGE_KEYS;

            let currentLang = 'az';

            const TRANSLATIONS = {
                az: {
                    login: "Daxil ol", signup: "Qeydiyyat", book_demo: "Demo Bron Et",
                    trusted_workflow: "Etibarlı işə qəbul prosesi", candidate_first: "Namizəd mərkəzli UX",
                    hero_title: "Daha ağıllı <br>\n<span style=\"background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; background-clip: text; color: transparent;\">hazırlıq.</span>",
                    hero_desc: "Namizədlər və rekruterlər üçün təkmilləşdirilmiş AI müsahibə mühiti — daha sakit, daha aydın və daha yaxşı qərarlar üçün yaradılıb. SilentInterview Versiyası.",
                    start_interview: "Müsahibəyə Başla", workflow_candidates: "Namizədlər üçün", workflow_recruiters: "Rekruterlər üçün",
                    wf_c1: "Vakansiya seçin və tələbləri nəzərdən keçirin", wf_c2: "AI dəstəkli video müsahibəni tamamlayın", wf_c3: "Ətraflı performans hesabatı əldə edin",
                    wf_r1: "Vakansiya yaradın və AI parametrlərini təyin edin", wf_r2: "AI-ni şirkət mədəniyyəti üzrə öyrədin", wf_r3: "Sıralanmış namizəd siyahılarını əldə edin",
                    product_highlights: "Məhsulun Xüsusiyyətləri", story_title: "Mükəmməl məhsul hekayəsi.", plans: "Planlar", client_notes: "Müştəri Rəyləri",
                    ready_to_modernize: "İşə qəbulu müasirləşdirməyə hazırsınız?",
                    ready_desc: "Sakit müsahibələr, dəqiq qiymətləndirmələr və daha yaxşı namizəd təcrübəsi yaratmaq üçün SilentInterview istifadə edən komandalara qoşulun.",
                    get_started_free: "Planı Seç", footer_desc: "Namizədlər və rekruterlər üçün təkmilləşdirilmiş işə qəbul platforması",
                    demo_title: "Demo Bron Et", schedule_demo: "Müsahibə Təyin Et",

                    auth_subtitle: "HR komandaları və namizədlər üçün yüksək keyfiyyətli iş mühiti — başlamaq asan, istifadəsi etibarlıdır.",
                    feat_1: "Rola əsaslanan giriş", feat_2: "Lokal hesab saxlama", feat_3: "Avtomatik yönləndirmə",
                    demo_accounts: "Demo hesablar", fill_hr: "HR Demo Doldur", fill_user: "İstifadəçi Demo Doldur",
                    terms: "Qeydiyyatdan keçməklə Şərtlərimizi qəbul edirsiniz. Avtomatik yönləndirmə aktivdir.",
                    btn_login: "Sistemə Daxil Ol", btn_signup: "Hesab Yarat və Daxil Ol",
                    menu: "Menyu", workspace: "İş Sahəsi", quick_tip: "Qısa İpucu",
                    tip_desc: "Kamera önizləməsi icazə verildikdə işləyir. İcazə verdiyinizdən əmin olun.",
                    recruiter_hub: "Rekruter Mərkəzi", candidate_portal: "Namizəd Portalı",
                    hub_desc: "Vakansiyalar yaradın, AI-ni öyrədin, namizədləri yoxlayın.",
                    portal_desc: "Müsahibələri məşq edin, kamera/mikrofonu yoxlayın.",
                    logout: "Çıxış", cancel: "Ləğv Et", confirm: "Təsdiq Et", delete: "Sil",

                    nav_dashboard: "İdarə paneli", nav_jobs: "Vakansiyalar", nav_training: "AI Təlimi",
                    nav_candidates: "Namizədlər", nav_analytics: "Analitika", nav_settings: "Tənzimləmələr",
                    nav_available: "Açıq Müsahibələr", nav_results: "Nəticələrim", nav_reports: "Hesabatlar", nav_profile: "Profil",

                    active_jobs: "Aktiv vakansiyalar", candidates_count: "Namizədlər",
                    interviews_completed: "Tamamlanmış müsahibələr", shortlisted_count: "Qısa siyahı",
                    hiring_funnel: "İşə qəbul qıfı", top_candidates: "Top namizədlər", no_candidates: "Hələ namizəd yoxdur",

                    create_job: "Vakansiya Yarat", job_title: "Vakansiyanın adı *", department: "Şöbə *",
                    experience_level: "Təcrübə səviyyəsi *", skills_required: "Tələb olunan bacarıqlar *",
                    company_culture: "Şirkət mədəniyyəti *", min_score: "Min. bal %", duration_min: "Müddət (dəq)",
                    generate_ai_interview: "AI Müsahibə Yarat", your_jobs: "Sizin Vakansiyalarınız", search_jobs: "Vakansiya axtar...",
                    skills_label: "Bacarıqlar:",

                    ai_training: "AI Təlimi", training_desc: "Şirkət materiallarını yükləyin və SilentInterview sizin üslubunuzu öyrənsin.",
                    upload_train: "Yüklə və Öyrət", no_training: "Hələ təlim yüklənməyib",
                    training_empty_desc: "AI müsahibə təcrübəsini fərdiləşdirmək üçün şirkət sənədlərini yükləyin.",
                    remove: "Sil", training_session: "Təlim sessiyası",

                    candidate_management: "Namizəd İdarəetməsi", candidate_desc: "Namizədləri avtomatik olaraq filtrləyin, nəzərdən keçirin və qısa siyahıya salın.",
                    auto_threshold: "Avto hədd: 70%",
                    filter_all: "HAMISI", filter_above_threshold: "HƏDDƏN YUXARI", filter_rejected: "RƏDD EDİLDİ",
                    filter_pending: "GÖZLƏYİR", filter_shortlisted: "QISA SİYAHI", filter_qualified: "KVALİFİKASİYALI",
                    col_candidate: "Namizəd ↕", col_job: "Vakansiya", col_score: "Bal ↕", col_confidence: "İnam",
                    col_stress: "Stres", col_communication: "Ünsiyyət", col_technical: "Texniki", col_culture: "Mədəniyyət", col_status: "Status",
                    no_candidates_found: "Namizəd tapılmadı",

                    avg_score: "Orta bal", shortlist_rate: "Qısa siyahı dərəcəsi", total_candidates: "Ümumi namizədlər", analytics: "Analitika",

                    settings: "Tənzimləmələr", full_name: "Ad və Soyad", email: "E-poçt", company: "Şirkət", role: "Rol",
                    save_changes: "Dəyişiklikləri Saxla", danger_zone: "Təhlükə Zonası", delete_account: "Hesabı Sil",
                    delete_desc: "Bu, hesabınızı və bütün məlumatlarınızı həmişəlik siləcək.",

                    available_interviews: "Açıq Müsahibələr", completed: "Tamamlandı",

                    my_results: "Nəticələrim", eye_contact: "Göz təması", clarity: "Aydınlıq", ai_feedback: "AI Rəyi",
                    no_results_yet: "Nəticə görmək üçün müsahibədə iştirak edin.", past_results: "Keçmiş Nəticələr",

                    reports: "Hesabatlar", download: "Yüklə", no_reports_yet: "Hələ hesabat yoxdur", profile: "Profil",

                    ai_interview: "AI Müsahibə", time_left: "Qalan vaxt", camera_preview: "Kamera önizləməsi", live: "canlı",
                    cam_required: "Kamera və mikrafon tələb olunur", press_start: "Başlamaq üçün icazə verin.",
                    speech_level: "Səs səviyyəsi", interview_questions: "Müsahibə Sualları", submit_interview: "Müsahibəni Göndər",
                    save_draft: "Qaralamanı Saxla", ai_interviewer: "AI Müsahibəçi", questions_count: "sual", current_question: "Cari sual",
                    tip_1: "Cavabları strukturlaşdırılmış saxlayın.", tip_2: "Sakit tempdən istifadə edin.", tip_3: "Cavab verməzdən əvvəl nəfəs alın.",
                    tip_4: "Nəticələri aydın qeyd edin.", no_interview_loaded: "Heç bir müsahibə yüklənməyib",
                    write_answer_here: "Burada cavabınızı yazın...", chars: "simvol", question: "Sual",
                    next_question: "Növbəti Sual", prev_question: "Əvvəlki", finish_interview: "Bitir və Göndər",

                    msg_plan_selected: "{plan} planı seçildi. Qeydiyyatdan keçərək başlaya bilərsiniz!",
                    msg_demo_success: "Demo sorğunuz qeydə alındı! 24 saat ərzində sizinlə əlaqə saxlayacağıq.",
                    msg_err_login: "E-poçt və ya şifrə yanlışdır.", msg_err_pass_len: "Şifrə minimum 6 simvol olmalıdır.",
                    msg_err_email_exist: "Bu e-poçt artıq qeydiyyatdan keçib.", msg_welcome: "Xoş gəldiniz, {name}!",
                    title_logout: "Çıxış", msg_logout: "Hesabınızdan çıxmaq istədiyinizə əminsiniz?",
                    msg_job_created: "Vakansiya uğurla yaradıldı!", title_del_job: "Vakansiyanı Sil",
                    msg_del_job: "Vakansiyanı silməkdə əminsiniz?", msg_job_deleted: "Vakansiya silindi.",
                    msg_ai_trained: "Süni intellekt təlimi bitdi!", title_del_train: "Təlimi Sil",
                    msg_del_train: "Bu təlim məlumatını silmək istəyirsiniz?", msg_train_deleted: "Təlim silindi.",
                    msg_settings_saved: "Tənzimləmələr yadda saxlanıldı!", title_del_acc: "Hesabı Sil",
                    msg_del_acc: "Hesabınız və bütün məlumatlarınız birdəfəlik silinəcək. Davam etmək istəyirsiniz?",
                    msg_acc_deleted: "Hesab silindi.", title_retake: "Yenidən Keç",
                    msg_retake: "Siz bu müsahibədən keçmisiniz. Yenidən keçmək köhnə nəticəni siləcək.",
                    msg_int_start: "Müsahibə başladı! Uğurlar!", msg_draft_saved: "Qaralama yadda saxlanıldı!",
                    title_confirm: "Təsdiq Et", msg_submit_int: "Müsahibəni göndərməkdə əminsiniz? Göndərdikdən sonra cavabları dəyişə bilməyəcəksiniz.",
                    msg_time_up: "Vaxt bitdi! Müsahibə göndərilir...", msg_cam_active: "Kamera və mikrafon aktivdir.",
                    msg_cam_denied: "Kamera icazəsi rədd edildi.", msg_int_done: "Müsahibə tamamlandı! Nəticə:",
                    msg_report_down: "Hesabat yüklənildi!", msg_demo_filled: "Məlumatlar dolduruldu. Davam edə bilərsiniz.",
                    feed_excellent: "Əla performans! Cavablarınız yaxşı strukturlaşdırılmış və aydındır.",
                    feed_good: "Orta performans. Bəzi hissələrdə daha spesifik detallara diqqət edə bilərsiniz.",
                    feed_poor: "Cavablarınızda inam və detallar zəifdir. Daha çox praktika lazımdır.",
                    hint_eye: "Göz təmasını daha yaxşı qoruyun.", hint_star: "STAR (Situation, Task, Action, Result) metodundan istifadə edin.",
                    hint_breathe: "Cavab verməzdən əvvəl kiçik fasilə edib dərindən nəfəs alın.", hint_tech: "Daha çox texniki detal və nəticə əlavə edin.",
                    hint_detail: "Cavablarınızı daha ətraflı izah edin.", hint_words: "Təcrübənizi göstərmək üçün daha geniş cavablar verməyə çalışın."
                },
                en: {
                    login: "Login", signup: "Sign Up", book_demo: "Book Demo",
                    trusted_workflow: "Trusted hiring workflow", candidate_first: "Candidate-first UX",
                    hero_title: "Smarter <br>\n<span style=\"background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; background-clip: text; color: transparent;\">preparation.</span>",
                    hero_desc: "A refined AI interview workspace for candidates and recruiters — calmer, clearer, and built for better decisions. SilentInterview Edition.",
                    start_interview: "Start Interview", workflow_candidates: "For Candidates", workflow_recruiters: "For Recruiters",
                    wf_c1: "Choose a job and review requirements", wf_c2: "Complete AI-powered video interview", wf_c3: "Receive detailed performance report",
                    wf_r1: "Create jobs and define AI parameters", wf_r2: "Train AI on your company culture", wf_r3: "Receive ranked candidate lists",
                    product_highlights: "Product Highlights", story_title: "A polished product story.", plans: "Plans", client_notes: "Client Notes",
                    ready_to_modernize: "Ready to modernize your hiring?",
                    ready_desc: "Join teams using SilentInterview to create calmer interviews, sharper evaluations, and better candidate experiences.",
                    get_started_free: "Select Plan", footer_desc: "A refined hiring platform for candidates and recruiters",
                    demo_title: "Book a Demo", schedule_demo: "Schedule Demo",

                    auth_subtitle: "A premium, conversion-friendly workspace for HR teams and candidates — simple to start, trustworthy to use.",
                    feat_1: "Role-based access", feat_2: "Local account storage", feat_3: "Automatic dashboard redirect",
                    demo_accounts: "Demo accounts", fill_hr: "Fill HR Demo", fill_user: "Fill User Demo",
                    terms: "By signing up, you agree to our Terms. Auto-redirect enabled.",
                    btn_login: "Login to Dashboard", btn_signup: "Create Account & Enter",
                    menu: "Menu", workspace: "Workspace", quick_tip: "Quick Tip",
                    tip_desc: "The camera preview works in modern browsers with permission. Ensure to allow access.",
                    recruiter_hub: "Recruiter Hub", candidate_portal: "Candidate Portal",
                    hub_desc: "Build roles, train AI, review candidates.", portal_desc: "Practice interviews, monitor camera/mic.",
                    logout: "Logout", cancel: "Cancel", confirm: "Confirm", delete: "Delete",

                    nav_dashboard: "Dashboard", nav_jobs: "Jobs", nav_training: "AI Training",
                    nav_candidates: "Candidates", nav_analytics: "Analytics", nav_settings: "Settings",
                    nav_available: "Available Interviews", nav_results: "My Results", nav_reports: "Reports", nav_profile: "Profile",

                    active_jobs: "Active jobs", candidates_count: "Candidates",
                    interviews_completed: "Interviews completed", shortlisted_count: "Shortlisted",
                    hiring_funnel: "Hiring funnel", top_candidates: "Top candidates", no_candidates: "No candidates yet",

                    create_job: "Create Job", job_title: "Job title *", department: "Department *",
                    experience_level: "Experience level *", skills_required: "Skills required *",
                    company_culture: "Company culture *", min_score: "Min score %", duration_min: "Duration (min)",
                    generate_ai_interview: "Generate AI Interview", your_jobs: "Your Jobs", search_jobs: "Search jobs...",
                    skills_label: "Skills:",

                    ai_training: "AI Training", training_desc: "Upload company materials and let SilentInterview learn your style.",
                    upload_train: "Upload & Train", no_training: "No training uploads yet",
                    training_empty_desc: "Upload company documents to customize the AI interview experience.",
                    remove: "Remove", training_session: "Training session",

                    candidate_management: "Candidate Management", candidate_desc: "Filter, review, and shortlist candidates automatically.",
                    auto_threshold: "Auto threshold: 70%",
                    filter_all: "ALL", filter_above_threshold: "ABOVE THRESHOLD", filter_rejected: "REJECTED",
                    filter_pending: "PENDING", filter_shortlisted: "SHORTLISTED", filter_qualified: "QUALIFIED",
                    col_candidate: "Candidate ↕", col_job: "Job Applied", col_score: "Score ↕", col_confidence: "Confidence",
                    col_stress: "Stress", col_communication: "Communication", col_technical: "Technical", col_culture: "Culture Fit", col_status: "Status",
                    no_candidates_found: "No candidates found",

                    avg_score: "Average score", shortlist_rate: "Shortlist rate", total_candidates: "Total candidates", analytics: "Analytics",

                    settings: "Settings", full_name: "Full Name", email: "Email", company: "Company", role: "Role",
                    save_changes: "Save Changes", danger_zone: "Danger Zone", delete_account: "Delete Account",
                    delete_desc: "This will permanently delete your account and all data.",

                    available_interviews: "Available Interviews", completed: "Completed",

                    my_results: "My Results", eye_contact: "Eye Contact", clarity: "Clarity", ai_feedback: "AI Feedback",
                    no_results_yet: "Take an interview first to see your results.", past_results: "Past Results",

                    reports: "Reports", download: "Download", no_reports_yet: "No reports yet", profile: "Profile",

                    ai_interview: "AI Interview", time_left: "Time left", camera_preview: "Camera preview", live: "live",
                    cam_required: "Camera and mic required", press_start: "Press start to enable preview.",
                    speech_level: "Speech level", interview_questions: "Interview Questions", submit_interview: "Submit Interview",
                    save_draft: "Save Draft", ai_interviewer: "AI Interviewer", questions_count: "questions", current_question: "Current question",
                    tip_1: "Keep answers structured.", tip_2: "Use a calm pace.", tip_3: "Breathe before answering.",
                    tip_4: "Mention outcomes clearly.", no_interview_loaded: "No interview loaded",
                    write_answer_here: "Write your answer here...", chars: "chars", question: "Question",
                    next_question: "Next Question", prev_question: "Previous", finish_interview: "Submit Interview",

                    msg_plan_selected: "{plan} plan selected. Sign up to get started!",
                    msg_demo_success: "Demo request received! We will contact you within 24 hours.",
                    msg_err_login: "Incorrect email or password.", msg_err_pass_len: "Password must be at least 6 characters.",
                    msg_err_email_exist: "This email is already registered.", msg_welcome: "Welcome, {name}!",
                    title_logout: "Logout", msg_logout: "Are you sure you want to log out?",
                    msg_job_created: "Job created successfully!", title_del_job: "Delete Job",
                    msg_del_job: "Are you sure you want to delete this job?", msg_job_deleted: "Job deleted.",
                    msg_ai_trained: "AI training completed!", title_del_train: "Delete Training",
                    msg_del_train: "Are you sure you want to delete this training data?", msg_train_deleted: "Training deleted.",
                    msg_settings_saved: "Settings saved!", title_del_acc: "Delete Account",
                    msg_del_acc: "Your account and all data will be permanently deleted. Continue?",
                    msg_acc_deleted: "Account deleted.", title_retake: "Retake Interview",
                    msg_retake: "You have already taken this interview. Retaking will delete previous results.",
                    msg_int_start: "Interview started! Good luck!", msg_draft_saved: "Draft saved!",
                    title_confirm: "Confirm", msg_submit_int: "Are you sure you want to submit? You cannot change answers after submission.",
                    msg_time_up: "Time is up! Submitting interview...", msg_cam_active: "Camera and mic are active.",
                    msg_cam_denied: "Camera permission denied.", msg_int_done: "Interview completed! Score:",
                    msg_report_down: "Report downloaded!", msg_demo_filled: "Demo details filled. You can continue.",
                    feed_excellent: "Excellent performance! Your answers are well-structured and clear.",
                    feed_good: "Average performance. Try to provide more specific details in some parts.",
                    feed_poor: "Your answers lack confidence and detail. More practice is needed.",
                    hint_eye: "Maintain better eye contact.", hint_star: "Use the STAR (Situation, Task, Action, Result) method.",
                    hint_breathe: "Take a short pause and breathe deeply before answering.", hint_tech: "Add more technical details and outcomes.",
                    hint_detail: "Explain your answers in more detail.", hint_words: "Try to give more comprehensive answers to show your experience."
                },
                ru: {
                    login: "Войти", signup: "Регистрация", book_demo: "Демо-версия",
                    trusted_workflow: "Надежный процесс найма", candidate_first: "UX для кандидатов",
                    hero_title: "Умная <br>\n<span style=\"background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; background-clip: text; color: transparent;\">подготовка.</span>",
                    hero_desc: "Усовершенствованная рабочая среда ИИ-интервью для кандидатов и рекрутеров — более спокойная и понятная. Версия SilentInterview.",
                    start_interview: "Начать интервью", workflow_candidates: "Для кандидатов", workflow_recruiters: "Для рекрутеров",
                    wf_c1: "Выберите вакансию и изучите требования", wf_c2: "Пройдите видеоинтервью с ИИ", wf_c3: "Получите подробный отчет",
                    wf_r1: "Создавайте вакансии и параметры ИИ", wf_r2: "Обучите ИИ культуре вашей компании", wf_r3: "Получайте ранжированные списки",
                    product_highlights: "Особенности продукта", story_title: "Идеальная история продукта.", plans: "Планы", client_notes: "Отзывы клиентов",
                    ready_to_modernize: "Готовы модернизировать наем?",
                    ready_desc: "Присоединяйтесь к командам, использующим SilentInterview, чтобы сделать наем спокойнее и точнее.",
                    get_started_free: "Выбрать план", footer_desc: "Усовершенствованная платформа найма для кандидатов и рекрутеров",
                    demo_title: "Забронировать демо", schedule_demo: "Назначить демо",

                    auth_subtitle: "Премиальное рабочее пространство для HR и кандидатов — легко начать, надежно использовать.",
                    feat_1: "Доступ по ролям", feat_2: "Локальное хранение", feat_3: "Авто-перенаправление",
                    demo_accounts: "Демо-аккаунты", fill_hr: "Заполнить демо HR", fill_user: "Заполнить демо юзера",
                    terms: "Регистрируясь, вы принимаете наши Условия. Авто-перенаправление включено.",
                    btn_login: "Войти в панель", btn_signup: "Создать аккаунт",
                    menu: "Меню", workspace: "Рабочая область", quick_tip: "Быстрый совет",
                    tip_desc: "Предпросмотр камеры работает с разрешения в браузере. Обязательно разрешите доступ.",
                    recruiter_hub: "Центр Рекрутера", candidate_portal: "Портал Кандидата",
                    hub_desc: "Создавайте роли, обучайте ИИ, проверяйте кандидатов.", portal_desc: "Практикуйте интервью, проверяйте камеру.",
                    logout: "Выйти", cancel: "Отмена", confirm: "Подтвердить", delete: "Удалить",

                    nav_dashboard: "Панель", nav_jobs: "Вакансии", nav_training: "Обучение ИИ",
                    nav_candidates: "Кандидаты", nav_analytics: "Аналитика", nav_settings: "Настройки",
                    nav_available: "Доступные интервью", nav_results: "Мои результаты", nav_reports: "Отчеты", nav_profile: "Профиль",

                    active_jobs: "Активные вакансии", candidates_count: "Кандидаты",
                    interviews_completed: "Завершенные интервью", shortlisted_count: "Отобранные",
                    hiring_funnel: "Воронка найма", top_candidates: "Лучшие кандидаты", no_candidates: "Пока нет кандидатов",

                    create_job: "Создать вакансию", job_title: "Название вакансии *", department: "Отдел *",
                    experience_level: "Уровень опыта *", skills_required: "Требуемые навыки *",
                    company_culture: "Культура компании *", min_score: "Мин. балл %", duration_min: "Продолжительность (мин)",
                    generate_ai_interview: "Создать ИИ-интервью", your_jobs: "Ваши вакансии", search_jobs: "Поиск вакансий...",
                    skills_label: "Навыки:",

                    ai_training: "Обучение ИИ", training_desc: "Загрузите материалы компании, чтобы SilentInterview изучил ваш стиль.",
                    upload_train: "Загрузить и обучить", no_training: "Пока нет загрузок",
                    training_empty_desc: "Загрузите документы компании для настройки ИИ-интервью.",
                    remove: "Удалить", training_session: "Обучающая сессия",

                    candidate_management: "Управление кандидатами", candidate_desc: "Фильтруйте и отбирайте кандидатов автоматически.",
                    auto_threshold: "Авто-порог: 70%",
                    filter_all: "ВСЕ", filter_above_threshold: "ВЫШЕ ПОРОГА", filter_rejected: "ОТКЛОНЕНЫ",
                    filter_pending: "В ОЖИДАНИИ", filter_shortlisted: "В ШОРТ-ЛИСТЕ", filter_qualified: "КВАЛИФИЦИРОВАНЫ",
                    col_candidate: "Кандидат ↕", col_job: "Вакансия", col_score: "Балл ↕", col_confidence: "Уверенность",
                    col_stress: "Стресс", col_communication: "Общение", col_technical: "Технический", col_culture: "Культура", col_status: "Статус",
                    no_candidates_found: "Кандидаты не найдены",

                    avg_score: "Средний балл", shortlist_rate: "Доля отобранных", total_candidates: "Всего кандидатов", analytics: "Аналитика",

                    settings: "Настройки", full_name: "Полное имя", email: "Эл. почта", company: "Компания", role: "Роль",
                    save_changes: "Сохранить изменения", danger_zone: "Опасная зона", delete_account: "Удалить аккаунт",
                    delete_desc: "Это навсегда удалит ваш аккаунт и все данные.",

                    available_interviews: "Доступные интервью", completed: "Завершено",

                    my_results: "Мои результаты", eye_contact: "Зрительный контакт", clarity: "Ясность", ai_feedback: "Отзыв ИИ",
                    no_results_yet: "Пройдите интервью, чтобы увидеть результаты.", past_results: "Прошлые результаты",

                    reports: "Отчеты", download: "Скачать", no_reports_yet: "Пока нет отчетов", profile: "Профиль",

                    ai_interview: "ИИ Интервью", time_left: "Осталось времени", camera_preview: "Предпросмотр камеры", live: "в эфире",
                    cam_required: "Требуется камера и микрофон", press_start: "Нажмите старт для предпросмотра.",
                    speech_level: "Уровень звука", interview_questions: "Вопросы интервью", submit_interview: "Отправить интервью",
                    save_draft: "Сохранить черновик", ai_interviewer: "ИИ Интервьюер", questions_count: "вопросов", current_question: "Текущий вопрос",
                    tip_1: "Структурируйте ответы.", tip_2: "Говорите спокойно.", tip_3: "Сделайте вдох перед ответом.",
                    tip_4: "Четко упоминайте результаты.", no_interview_loaded: "Интервью не загружено",
                    write_answer_here: "Напишите ваш ответ здесь...", chars: "символов", question: "Вопрос",
                    next_question: "Следующий Вопрос", prev_question: "Предыдущий", finish_interview: "Завершить интервью",

                    msg_plan_selected: "План {plan} выбран. Зарегистрируйтесь, чтобы начать!",
                    msg_demo_success: "Запрос демо получен! Мы свяжемся с вами в течение 24 часов.",
                    msg_err_login: "Неверный email или пароль.", msg_err_pass_len: "Пароль должен состоять минимум из 6 символов.",
                    msg_err_email_exist: "Этот email уже зарегистрирован.", msg_welcome: "Добро пожаловать, {name}!",
                    title_logout: "Выйти", msg_logout: "Вы уверены, что хотите выйти?",
                    msg_job_created: "Вакансия успешно создана!", title_del_job: "Удалить вакансию",
                    msg_del_job: "Вы уверены, что хотите удалить эту вакансию?", msg_job_deleted: "Вакансия удалена.",
                    msg_ai_trained: "Обучение ИИ завершено!", title_del_train: "Удалить обучение",
                    msg_del_train: "Вы уверены, что хотите удалить эти данные обучения?", msg_train_deleted: "Обучение удалено.",
                    msg_settings_saved: "Настройки сохранены!", title_del_acc: "Удалить аккаунт",
                    msg_del_acc: "Ваш аккаунт и все данные будут навсегда удалены. Продолжить?",
                    msg_acc_deleted: "Аккаунт удален.", title_retake: "Пересдать",
                    msg_retake: "Вы уже проходили это интервью. Пересдача удалит предыдущие результаты.",
                    msg_int_start: "Интервью началось! Удачи!", msg_draft_saved: "Черновик сохранен!",
                    title_confirm: "Подтвердить", msg_submit_int: "Вы уверены, что хотите отправить? Изменить ответы после отправки будет нельзя.",
                    msg_time_up: "Время вышло! Отправка интервью...", msg_cam_active: "Камера и микрофон активны.",
                    msg_cam_denied: "Доступ к камере отклонен.", msg_int_done: "Интервью завершено! Результат:",
                    msg_report_down: "Отчет скачан!", msg_demo_filled: "Данные демо заполнены. Можете продолжить.",
                    feed_excellent: "Отличная работа! Ваши ответы хорошо структурированы и понятны.",
                    feed_good: "Средний результат. Попробуйте давать более конкретные детали в некоторых местах.",
                    feed_poor: "В ваших ответах не хватает уверенности и деталей. Нужна практика.",
                    hint_eye: "Поддерживайте лучший зрительный контакт.", hint_star: "Используйте метод STAR (Ситуация, Задача, Действие, Результат).",
                    hint_breathe: "Сделайте короткую паузу и глубокий вдох перед ответом.", hint_tech: "Добавьте больше технических деталей и результатов.",
                    hint_detail: "Объясняйте свои ответы более подробно.", hint_words: "Старайтесь давать более развернутые ответы, чтобы показать свой опыт."
                }
            };

            const FEATURE_CARDS = {
                az: [
                    { icon: '🎥', title: 'AI Müsahibə Sessiyaları', text: 'Canlı vebkamera önizləməsi və aydın sual axını ilə strukturlaşdırılmış müsahibələr.' },
                    { icon: '👁', title: 'İnsayt Siqnalları', text: 'Göz təması, inam, aydınlıq və stres səviyyəsi sakit formatda təqdim edilir.' },
                    { icon: '🧠', title: 'Cavab Kouçluğu', text: 'Namizədlərin inkişafı üçün danışıq tempi və çatdırılma izlənilir.' },
                    { icon: '💪', title: 'İnam Balı', text: 'Cavab keyfiyyətini, strukturunu və mövcudluğunu bir rəqəmlə ümumiləşdirin.' },
                    { icon: '🎤', title: 'Nitq İcmalı', text: 'Mikrofon aktivliyi və danışıq ritmi təcrübə və icmal üçün vurğulanır.' },
                    { icon: '📚', title: 'Xüsusi Rubrikalar', text: 'Müsahibəni şirkətinizin qaydalarına və tonuna uyğunlaşdırın.' },
                    { icon: '📊', title: 'Namizəd Sıralaması', text: 'Namizədləri aydın müqayisə edin və həddi keçənləri qısa siyahıya salın.' },
                    { icon: '📈', title: 'İşə Qəbul Analitikası', text: 'Sistemin sağlamlığını və keyfiyyətini qarmaqarışıqlıq olmadan görün.' }
                ],
                en: [
                    { icon: '🎥', title: 'AI Interview Sessions', text: 'Structured interviews with live webcam preview and clean question flow.' },
                    { icon: '👁', title: 'Insight Signals', text: 'Eye contact, confidence, clarity, and stress surfaced in a calm format.' },
                    { icon: '🧠', title: 'Response Coaching', text: 'Track pacing and delivery so candidates can improve naturally.' },
                    { icon: '💪', title: 'Confidence Score', text: 'Summarize response quality, structure, and presence in one number.' },
                    { icon: '🎤', title: 'Speech Review', text: 'Mic activity and speaking rhythm highlighted for practice and review.' },
                    { icon: '📚', title: 'Custom Rubrics', text: 'Adapt the interview to your company playbook and tone.' },
                    { icon: '📊', title: 'Candidate Ranking', text: 'Compare candidates clearly and shortlist above your threshold.' },
                    { icon: '📈', title: 'Hiring Analytics', text: 'See funnel health, quality, and throughput without clutter.' }
                ],
                ru: [
                    { icon: '🎥', title: 'ИИ Интервью', text: 'Структурированные интервью с предпросмотром камеры и четким потоком вопросов.' },
                    { icon: '👁', title: 'Сигналы Инсайтов', text: 'Зрительный контакт, уверенность, ясность и стресс представлены в спокойном формате.' },
                    { icon: '🧠', title: 'Коучинг Ответов', text: 'Отслеживание темпа и подачи, чтобы кандидаты могли совершенствоваться.' },
                    { icon: '💪', title: 'Оценка Уверенности', text: 'Качество ответа, структура и присутствие в одной цифре.' },
                    { icon: '🎤', title: 'Анализ Речи', text: 'Активность микрофона и ритм речи для практики и анализа.' },
                    { icon: '📚', title: 'Пользовательские Рубрики', text: 'Адаптируйте интервью под стиль вашей компании.' },
                    { icon: '📊', title: 'Рейтинг Кандидатов', text: 'Сравнивайте кандидатов и отбирайте лучших.' },
                    { icon: '📈', title: 'Аналитика Найма', text: 'Просматривайте воронку и качество найма без лишнего шума.' }
                ]
            };

            const PRICING = {
                az: [
                    { name: 'Başlanğıc', price: '$49/ay', desc: 'Daha mükəmməl müsahibə prosesi quran kiçik komandalar üçün.', features: ['5 aktiv vakansiya', '50 müsahibə/ay', 'Əsas analitika', 'Email dəstəyi'] },
                    { name: 'Böyümə', price: '$149/ay', desc: 'Təlim, analitika və qısa siyahı məntiqini bir yerdə istəyən komandalar üçün.', features: ['25 aktiv vakansiya', '500 müsahibə/ay', 'AI təlimi', 'Prioritet dəstək', 'Komanda əməkdaşlığı'] },
                    { name: 'Müəssisə', price: 'Fərdi', desc: 'Miqyas, SSO və xüsusi iş axını dizaynına ehtiyacı olan təşkilatlar üçün.', features: ['Limitsiz vakansiya', 'Limitsiz müsahibə', 'SSO & SAML', 'Xüsusi AI modelləri', 'Fərdi uğur meneceri'] }
                ],
                en: [
                    { name: 'Starter', price: '$49/mo', desc: 'For smaller teams building a more polished interview process.', features: ['5 active jobs', '50 interviews/mo', 'Core analytics', 'Email support'] },
                    { name: 'Growth', price: '$149/mo', desc: 'For teams that want training, analytics, and shortlist logic in one place.', features: ['25 active jobs', '500 interviews/mo', 'AI training', 'Priority support', 'Team collaboration'] },
                    { name: 'Enterprise', price: 'Custom', desc: 'For organizations that need scale, SSO, and custom workflow design.', features: ['Unlimited jobs', 'Unlimited interviews', 'SSO & SAML', 'Custom AI models', 'Dedicated success manager'] }
                ],
                ru: [
                    { name: 'Стартовый', price: '$49/мес', desc: 'Для небольших команд, улучшающих процесс интервью.', features: ['5 активных вакансий', '50 интервью/мес', 'Базовая аналитика', 'Email поддержка'] },
                    { name: 'Рост', price: '$149/мес', desc: 'Для команд, которым нужно всё в одном месте.', features: ['25 активных вакансий', '500 интервью/мес', 'Обучение ИИ', 'Приоритетная поддержка', 'Совместная работа'] },
                    { name: 'Корпоративный', price: 'Индивидуально', desc: 'Для организаций с потребностью в масштабе и SSO.', features: ['Безлимит вакансий', 'Безлимит интервью', 'SSO и SAML', 'Свои модели ИИ', 'Персональный менеджер'] }
                ]
            };

            const TESTIMONIALS = {
                az: [
                    { quote: 'İnterfeys çox sakit və peşəkar hiss etdirir, bu da işə qəbul prosesimizi daha etibarlı edir.', name: 'Sarah Chen', role: 'İstedadlar üzrə Rəhbər', company: 'TechFlow' },
                    { quote: 'Namizədlər prosesi çox asanlıqla başa düşür və rəylər kənar səs-küy olmadan aydındır.', name: 'Marcus Johnson', role: 'Məhsul Dizayneri', company: 'DesignCo' },
                    { quote: 'Böyük həcmli işə qəbulları tablosunda heç bir qarmaqarışıqlıq olmadan nəzərdən keçirə bilirik.', name: 'Elena Rodriguez', role: 'HR Direktoru', company: 'ScaleUp Inc' }
                ],
                en: [
                    { quote: 'The interface feels calm and professional, which makes our hiring process easier to trust.', name: 'Sarah Chen', role: 'Talent Ops Lead', company: 'TechFlow' },
                    { quote: 'Candidates understand the flow quickly, and the feedback is clear without feeling overwhelming.', name: 'Marcus Johnson', role: 'Product Designer', company: 'DesignCo' },
                    { quote: 'We can review high-volume hiring without the dashboard feeling busy or noisy.', name: 'Elena Rodriguez', role: 'HR Director', company: 'ScaleUp Inc' }
                ],
                ru: [
                    { quote: 'Интерфейс выглядит спокойным и профессиональным, что вызывает доверие к процессу.', name: 'Сара Чен', role: 'Руководитель HR', company: 'TechFlow' },
                    { quote: 'Кандидаты легко понимают процесс, а отзывы четкие и не перегружены деталями.', name: 'Маркус Джонсон', role: 'Дизайнер Продукта', company: 'DesignCo' },
                    { quote: 'Мы можем обрабатывать большой объем найма без визуального шума.', name: 'Елена Родригес', role: 'HR Директор', company: 'ScaleUp Inc' }
                ]
            };

            const ICONS = { dashboard: '▣', jobs: '⌘', training: '◫', candidates: '◌', analytics: '◔', settings: '⚙', available: '▣', results: '◉', reports: '⇣', profile: '☺' };

            const NAV = {
                RECRUITER: [
                    { key: 'dashboard' }, { key: 'jobs' }, { key: 'training' },
                    { key: 'candidates' }, { key: 'analytics' }, { key: 'settings' }
                ],
                CANDIDATE: [
                    { key: 'available' }, { key: 'results' },
                    { key: 'reports' }, { key: 'profile' }
                ]
            };

            const state = {
                view: 'landing', authMode: 'login', activeNav: 'dashboard', interviewDraft: null,
                confirmCallback: null, searchQuery: '', currentQIdx: 0, proctor: null, interviewSession: null, answerRecords: [],
                mediaRequestId: 0, mediaStarting: false, interviewSubmitting: false
            };
            let charts = { funnel: null, bar: null, pie: null };
            let mic = { audioCtx: null, analyser: null, stream: null, raf: null, level: 0 };
            let recordedAudio = { recorder: null, chunks: [] };
            let speech = {
                recognition: null, shouldListen: false, isStarting: false, finalText: '',
                interimText: '', baseText: '', silenceTimer: null, restartTimer: null,
                questionIndex: -1
            };

            const PROCTOR_MESSAGES = {
                EYE_AWAY: 'Diqqət siqnalı: ekran fokusunun yenidən yoxlanması tövsiyə olunur.',
                TOO_CLOSE: 'Kamera çərçivəsini rahatlaşdırmaq üçün bir qədər aralı əyləşin.',
                INTEGRITY_REVIEW: 'Kamera görüntüsündə yoxlanmalı dəyişiklik aşkarlandı.'
            };

            function resetProctoring() {
                state.proctor = {
                    status: 'OK', warning: '', requiresReview: false, incidents: [],
                    lookAwaySince: null, eyeWarningActive: false, proximityWarningActive: false,
                    latestTelemetry: { faceCount: null, faceAreaRatio: null, lookingAtScreen: null, lookAwayMs: 0 }
                };
            }

            function currentInterviewQuestion() {
                const d = state.interviewDraft;
                return d?.questions?.[state.currentQIdx] || '';
            }

            function speakInterviewOutput(text) {
                if (!text || !window.SilentInterviewSpeechEnabled || !('speechSynthesis' in window)) return;
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'az-AZ';
                window.speechSynthesis.speak(utterance);
            }

            // Single frontend contract for both interviewer prompts and proctoring decisions.
            function publishInterviewOutput({ proctor_status = 'OK', warning_message = '', interview_question = currentInterviewQuestion(), spoken_audio_text = '' } = {}) {
                const output = { proctor_status, warning_message, interview_question, spoken_audio_text };
                window.latestInterviewOutput = output;
                window.dispatchEvent(new CustomEvent('silentInterview:output', { detail: output }));

                const alert = document.getElementById('proctorAlert');
                const status = document.getElementById('proctorStatus');
                const proctorPill = document.getElementById('aiProctorPill');
                const stage = document.getElementById('candidateStage');
                const toast = document.getElementById('proctorToast');
                if (alert) {
                    alert.className = `proctor-alert ${proctor_status.toLowerCase()}`;
                    alert.textContent = warning_message || 'Proktorinq statusu: qaydalar normaldır.';
                }
                if (status) status.textContent = proctor_status === 'OK' ? 'AI Proctor: Aktiv' : proctor_status === 'WARNING' ? 'AI Proctor: Diqqət' : 'AI Proctor: Yoxlama';
                if (proctorPill) proctorPill.className = `ai-proctor-pill ${proctor_status.toLowerCase()}`;
                if (stage) stage.className = `candidate-stage proctor-${proctor_status.toLowerCase()}`;
                if (toast && warning_message) {
                    clearTimeout(window.proctorToastTimer);
                    toast.className = `camera-proctor-toast ${proctor_status.toLowerCase()}`;
                    toast.textContent = warning_message;
                    window.proctorToastTimer = setTimeout(() => { toast.className = 'camera-proctor-toast hidden-i'; }, 4200);
                }
                speakInterviewOutput(spoken_audio_text);
                return output;
            }

            function setInterviewControlsDisabled(disabled) {
                ['currentAnswer', 'prevQBtn', 'nextQBtn', 'submitInterviewBtn'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.disabled = disabled;
                });
            }

            function flagInterviewForReview() {
                if (!state.interviewDraft || state.proctor?.requiresReview) return window.latestInterviewOutput;
                state.proctor.requiresReview = true;
                state.proctor.status = 'REVIEW_REQUIRED';
                state.proctor.warning = PROCTOR_MESSAGES.INTEGRITY_REVIEW;
                state.proctor.incidents.push({ type: 'FRAME_REVIEW', at: new Date().toISOString() });
                state.interviewDraft.integrityStatus = 'REVIEW_REQUIRED';
                state.interviewDraft.integrityIncidents = state.proctor.incidents;
                return publishInterviewOutput({
                    proctor_status: 'REVIEW_REQUIRED',
                    warning_message: PROCTOR_MESSAGES.INTEGRITY_REVIEW,
                    interview_question: currentInterviewQuestion(),
                    spoken_audio_text: PROCTOR_MESSAGES.INTEGRITY_REVIEW
                });
            }

            function issueProctorWarning(type, message) {
                if (!state.proctor || state.proctor.requiresReview) return window.latestInterviewOutput;
                const alreadyActive = type === 'EYE_AWAY' ? state.proctor.eyeWarningActive : state.proctor.proximityWarningActive;
                if (alreadyActive) return window.latestInterviewOutput;
                if (type === 'EYE_AWAY') state.proctor.eyeWarningActive = true;
                if (type === 'TOO_CLOSE') state.proctor.proximityWarningActive = true;
                state.proctor.status = 'WARNING'; state.proctor.warning = message;
                state.proctor.incidents.push({ type, at: new Date().toISOString() });
                return publishInterviewOutput({
                    proctor_status: 'WARNING', warning_message: message,
                    spoken_audio_text: message
                });
            }

            // Accepts telemetry from the camera-analysis layer without treating emotion as eye direction.
            window.provideProctorTelemetry = function (telemetry = {}) {
                if (!state.interviewDraft || !state.proctor || state.proctor.requiresReview) return window.latestInterviewOutput;
                const p = state.proctor;
                const faceCount = Number.isFinite(Number(telemetry.faceCount)) ? Number(telemetry.faceCount) : null;
                const faceAreaRatio = Number.isFinite(Number(telemetry.faceAreaRatio)) ? Number(telemetry.faceAreaRatio) : null;
                const lookingAtScreen = typeof telemetry.lookingAtScreen === 'boolean' ? telemetry.lookingAtScreen : typeof telemetry.eyeOnScreen === 'boolean' ? telemetry.eyeOnScreen : null;
                let lookAwayMs = Number.isFinite(Number(telemetry.lookAwayMs)) ? Math.max(0, Number(telemetry.lookAwayMs)) : null;
                p.latestTelemetry = { faceCount, faceAreaRatio, lookingAtScreen, lookAwayMs: lookAwayMs ?? p.latestTelemetry.lookAwayMs };

                if (faceCount !== null && faceCount !== 1) return flagInterviewForReview();

                if (lookingAtScreen === true || lookAwayMs === 0) {
                    p.lookAwaySince = null;
                    p.eyeWarningActive = false;
                } else if (lookingAtScreen === false && lookAwayMs === null) {
                    p.lookAwaySince = p.lookAwaySince || Date.now();
                    lookAwayMs = Date.now() - p.lookAwaySince;
                }

                if (lookAwayMs !== null && lookAwayMs > 3000) issueProctorWarning('EYE_AWAY', PROCTOR_MESSAGES.EYE_AWAY);
                if (faceAreaRatio !== null && faceAreaRatio > 0.60) issueProctorWarning('TOO_CLOSE', PROCTOR_MESSAGES.TOO_CLOSE);
                if (faceAreaRatio !== null && faceAreaRatio <= 0.56) p.proximityWarningActive = false;

                if (!p.eyeWarningActive && !p.proximityWarningActive) {
                    p.status = 'OK'; p.warning = '';
                    return publishInterviewOutput({ proctor_status: 'OK', spoken_audio_text: '' });
                }
                return window.latestInterviewOutput;
            };

            window.addEventListener('silentInterview:proctor-telemetry', (event) => window.provideProctorTelemetry(event.detail || {}));

            // ===== UTILITIES =====
            window.changeLang = function (lang) {
                currentLang = lang;
                document.documentElement.lang = lang;
                syncSpeechLanguage();
                window.dispatchEvent(new CustomEvent('silentInterview:language-changed', { detail: { lang } }));
                render();
            }

            function t(key) { return translate(TRANSLATIONS, currentLang, key); }

            function applyTranslations() {
                applyDomTranslations(TRANSLATIONS, currentLang);
            }

            const uid = createId;
            const load = readStoredValue;
            const save = writeStoredValue;
            function theme() { return document.documentElement.dataset.theme || 'light'; }
            function setTheme(thm) { document.documentElement.dataset.theme = thm; save(LS.theme, thm); }
            window.toggleTheme = function () { setTheme(theme() === 'light' ? 'dark' : 'light'); renderCharts(); }
            function users() { return load(LS.users, []); }
            function jobs() { return load(LS.jobs, []); }
            function apps() { return load(LS.apps, []); }
            function trainings() { return load(LS.training, []); }
            function interviews() { return load(LS.interviews, []); }
            function session() { return load(LS.session, null); }
            function currentUser() { return findAuthenticatedUser(session(), users()); }
            const clamp = clampNumber;
            const avg = calculateAverage;
            function getCss(key) { return getComputedStyle(document.documentElement).getPropertyValue(key).trim(); }

            // ===== TOAST SYSTEM =====
            function toast(message, type = 'info', duration = 2500) {
                const container = document.getElementById('toastContainer');
                const el = document.createElement('div');
                el.className = `toast ${type} premium-card rounded-2xl p-4 flex items-center gap-3`;
                const icons = { success: '✓', error: '✕', info: 'ℹ' };
                el.innerHTML = `<span class="text-lg shrink-0">${icons[type]}</span><span class="text-sm font-medium leading-tight">${message}</span>`;
                container.appendChild(el);
                setTimeout(() => { el.style.opacity = '0'; el.style.transform = window.innerWidth > 640 ? 'translateX(100%)' : 'translateY(-20px)'; setTimeout(() => el.remove(), 300); }, duration);
            }

            // ===== MODALS =====
            function showConfirm(title, message, onConfirm, danger = true) {
                state.confirmCallback = onConfirm;
                document.getElementById('confirmTitle').textContent = title;
                document.getElementById('confirmMessage').textContent = message;

                const btnCancel = document.getElementById('btnCancelConfirm');
                btnCancel.textContent = t('cancel');

                const btn = document.getElementById('confirmActionBtn');
                btn.className = danger ? 'btn btn-danger flex-1' : 'btn btn-primary flex-1';
                btn.textContent = danger ? t('delete') : t('confirm');
                btn.onclick = () => { closeConfirmModal(); if (state.confirmCallback) state.confirmCallback(); };
                const modal = document.getElementById('confirmModal');
                modal.classList.remove('hidden-i'); requestAnimationFrame(() => modal.classList.add('active'));
            }
            window.closeConfirmModal = function () { const modal = document.getElementById('confirmModal'); modal.classList.remove('active'); setTimeout(() => modal.classList.add('hidden-i'), 200); }
            window.openDemoModal = function () { const modal = document.getElementById('demoModal'); modal.classList.remove('hidden-i'); requestAnimationFrame(() => modal.classList.add('active')); }
            window.closeDemoModal = function () { const modal = document.getElementById('demoModal'); modal.classList.remove('active'); setTimeout(() => modal.classList.add('hidden-i'), 200); document.getElementById('demoForm')?.reset(); }
            window.togglePasswordVisibility = function () { const input = document.getElementById('authPassword'); const btn = input.parentElement.querySelector('.password-toggle'); if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; } else { input.type = 'password'; btn.textContent = '👁'; } }
            window.fillDemoAccount = function (role) {
                if (role === 'RECRUITER') {
                    document.getElementById('authEmail').value = 'aytaj.shakarzade@silentinterview.com';
                    document.getElementById('authPassword').value = 'Aytaj123!';
                } else {
                    document.getElementById('authEmail').value = 'aydan.shakarzade@gmail.com';
                    document.getElementById('authPassword').value = 'Aydan123!';
                }

                if (state.authMode !== 'login') {
                    state.authMode = 'login';
                    document.getElementById('tabLogin')?.click();
                }

                toast(t('msg_demo_filled'), 'info');
            };
            // Server data is hydrated after authentication; no demo users or local CRUD data are created.
            function seed() { setTheme('light'); }

            // ===== EFFECTS =====
            document.addEventListener('mousemove', (e) => {
                const cursor = document.querySelector('.custom-cursor');
                const dot = document.querySelector('.custom-cursor-dot');
                if (cursor && window.innerWidth > 768) { cursor.style.left = e.clientX - 10 + 'px'; cursor.style.top = e.clientY - 10 + 'px'; }
                if (dot && window.innerWidth > 768) { dot.style.left = e.clientX - 2 + 'px'; dot.style.top = e.clientY - 2 + 'px'; }

                const bg = document.getElementById('heroBg');
                if (bg) {
                    const x = (e.clientX / window.innerWidth) * 100;
                    const y = (e.clientY / window.innerHeight) * 100;
                    bg.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(99, 102, 241, 0.14) 0%, transparent 40%), radial-gradient(circle at ${100 - x}% ${100 - y}%, rgba(168, 85, 247, 0.11) 0%, transparent 40%)`;
                }
            });
            document.addEventListener('mousedown', () => document.querySelector('.custom-cursor')?.classList.add('hover'));
            document.addEventListener('mouseup', () => document.querySelector('.custom-cursor')?.classList.remove('hover'));

            function initParticles() {
                const canvas = document.getElementById('particle-canvas');
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                let particles = [];
                function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
                resize(); window.addEventListener('resize', resize);
                for (let i = 0; i < 40; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, size: Math.random() * 2 + 1 });
                function animate() {
                    if (!document.getElementById('particle-canvas')) return;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#6366f1';
                    particles.forEach((p, i) => {
                        p.x += p.vx; p.y += p.vy;
                        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
                    });
                    requestAnimationFrame(animate);
                }
                animate();
            }


            const speechRestartableErrors = new Set(['network', 'no-speech', 'audio-capture', 'aborted']);
            const speechState = speech;

            function getCurrentSpeechLang() {
                return currentLang === 'ru' ? 'ru-RU' : currentLang === 'en' ? 'en-US' : 'az-AZ';
            }

            function syncSpeechLanguage() {
                const recognition = speechState.recognition;
                if (recognition) recognition.lang = getCurrentSpeechLang();
            }

            function setSpeechUI({ listening = false, message = '' } = {}) {
                const pill = document.getElementById('speechStatusPill');
                const level = document.getElementById('speechLevel');
                const label = document.getElementById('speechStatusText');
                if (pill) pill.className = listening ? 'speech-pill live' : 'speech-pill idle';
                if (label) label.textContent = message || (listening ? 'Dinləyir' : 'Hazır');
                if (level && mic.level !== null) level.textContent = `${Math.round((mic.level || 0) * 100)}%`;
            }

            function currentAnswerElement() {
                return document.getElementById('currentAnswer');
            }

            function getQuestionAnswers() {
                const draft = state.interviewDraft;
                if (!draft) return [];
                if (!Array.isArray(draft.answers)) draft.answers = Array.from({ length: draft.questions?.length || 0 }, () => '');
                return draft.answers;
            }

            function persistDraftSnapshot() {
                const draft = state.interviewDraft;
                if (!draft) return;
                const me = currentUser();
                if (!me) return;
                const key = `${me.id}_${draft.jobId}`;
                const drafts = load(LS.drafts, {});
                drafts[key] = {
                    ...draft,
                    currentQIdx: state.currentQIdx,
                    updatedAt: new Date().toISOString()
                };
                save(LS.drafts, drafts);
            }

            function restoreDraftSnapshot(jobId) {
                const me = currentUser();
                if (!me) return null;
                const drafts = load(LS.drafts, {});
                return drafts[`${me.id}_${jobId}`] || null;
            }

            function normalizeTranscriptValue(value) {
                return String(value || '').replace(/\s+/g, ' ').trim();
            }

            function buildAnswerValue(baseText, finalText, interimText) {
                const parts = [normalizeTranscriptValue(baseText), normalizeTranscriptValue(finalText), normalizeTranscriptValue(interimText)].filter(Boolean);
                return normalizeTranscriptValue(parts.join(' '));
            }

            function commitSpeechToAnswer() {
                const draft = state.interviewDraft;
                if (!draft) return '';
                const idx = state.currentQIdx;
                const answers = getQuestionAnswers();
                const nextValue = buildAnswerValue(speechState.baseText, speechState.finalText, speechState.interimText);
                answers[idx] = nextValue;
                draft.answers = answers;
                if (draft.originalAnswers && Array.isArray(draft.originalAnswers)) draft.originalAnswers[idx] = nextValue;
                const ta = currentAnswerElement();
                if (ta && state.currentQIdx === idx) ta.value = nextValue;
                persistDraftSnapshot();
                return nextValue;
            }

            function setSpeechFromTextarea(value, { preserveFinal = true } = {}) {
                const next = normalizeTranscriptValue(value);
                speechState.baseText = next;
                if (!preserveFinal) speechState.finalText = '';
                speechState.interimText = '';
                commitSpeechToAnswer();
            }

            function clearSpeechTimers() {
                clearTimeout(speechState.restartTimer);
                clearTimeout(speechState.silenceTimer);
                speechState.restartTimer = null;
                speechState.silenceTimer = null;
            }

            function restartSpeechRecognition(delay = 250) {
                clearTimeout(speechState.restartTimer);
                if (!speechState.shouldListen || state.interviewSubmitting || !state.interviewDraft || state.activeNav !== 'interview') return;
                speechState.restartTimer = setTimeout(() => {
                    speechState.restartTimer = null;
                    if (speechState.shouldListen && !state.interviewSubmitting && state.interviewDraft && state.activeNav === 'interview') {
                        startSpeechToText();
                    }
                }, delay);
            }

            function stopSpeechToText({ keepMessage = false, discardInstance = false, suppressRestart = true, preserveText = false } = {}) {
                speechState.shouldListen = false;
                speechState.isStarting = false;
                if (suppressRestart) clearTimeout(speechState.restartTimer);
                speechState.restartTimer = null;
                clearTimeout(speechState.silenceTimer);
                speechState.silenceTimer = null;
                const recognition = speechState.recognition;
                if (recognition) {
                    try { recognition.onstart = null; } catch { }
                    try { recognition.onresult = null; } catch { }
                    try { recognition.onerror = null; } catch { }
                    try { recognition.onend = null; } catch { }
                    try { recognition.onnomatch = null; } catch { }
                    try { recognition.stop(); } catch { }
                    try { recognition.abort(); } catch { }
                }
                if (discardInstance) speechState.recognition = null;
                if (!preserveText) {
                    speechState.finalText = '';
                    speechState.interimText = '';
                    speechState.baseText = '';
                }
                speechState.questionIndex = -1;
                if (!keepMessage) setSpeechUI({ listening: false, message: '' });
            }

            function ensureSpeechInstance() {
                const SpeechRecognition = getSpeechRecognitionConstructor();
                if (!SpeechRecognition) return null;
                if (speechState.recognition) {
                    syncSpeechLanguage();
                    return speechState.recognition;
                }
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.maxAlternatives = 1;
                recognition.lang = getCurrentSpeechLang();
                recognition.onstart = () => {
                    speechState.isStarting = false;
                    setSpeechUI({ listening: true, message: 'Dinləyir və mətnə çevirir' });
                };
                recognition.onresult = handleSpeechResult;
                recognition.onerror = handleSpeechError;
                recognition.onend = handleSpeechEnd;
                recognition.onnomatch = () => {
                    if (speechState.shouldListen && !state.interviewSubmitting) restartSpeechRecognition(150);
                };
                speechState.recognition = recognition;
                return recognition;
            }

            function startSpeechToText() {
                const recognition = ensureSpeechInstance();
                if (!recognition) {
                    setSpeechUI({ listening: false, message: 'Bu brauzer Speech Recognition dəstəkləmir' });
                    return;
                }
                if (!state.interviewDraft || state.activeNav !== 'interview' || state.interviewSubmitting) return;
                syncSpeechLanguage();
                if (speechState.shouldListen || speechState.isStarting) return;
                speechState.shouldListen = true;
                speechState.isStarting = true;
                speechState.questionIndex = state.currentQIdx;
                const answers = getQuestionAnswers();
                speechState.baseText = normalizeTranscriptValue(answers[state.currentQIdx] || '');
                speechState.finalText = '';
                speechState.interimText = '';
                commitSpeechToAnswer();
                try {
                    recognition.start();
                } catch (e) {
                    speechState.isStarting = false;
                    const name = String(e?.name || e?.message || '').toLowerCase();
                    if (name.includes('invalidstate')) restartSpeechRecognition(250);
                }
            }

            function handleSpeechResult(event) {
                if (!speechState.shouldListen || !state.interviewDraft || state.interviewSubmitting) return;
                const idx = state.currentQIdx;
                let finalChunks = [];
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    const transcript = normalizeTranscriptValue(result?.[0]?.transcript || '');
                    if (!transcript) continue;
                    if (result.isFinal) finalChunks.push(transcript);
                    else interim = transcript;
                }
                if (finalChunks.length) {
                    const merged = normalizeTranscriptValue(finalChunks.join(' '));
                    speechState.finalText = buildAnswerValue(speechState.finalText, merged, '');
                    speechState.interimText = '';
                } else {
                    speechState.interimText = interim;
                }
                commitSpeechToAnswer();
                clearTimeout(speechState.silenceTimer);
                speechState.silenceTimer = setTimeout(() => {
                    if (speechState.shouldListen && state.interviewDraft && !state.interviewSubmitting && state.activeNav === 'interview' && state.currentQIdx === idx) {
                        commitSpeechToAnswer();
                    }
                }, 1200);
            }

            function handleSpeechError(event) {
                const error = String(event?.error || event?.name || 'unknown').toLowerCase();
                speechState.isStarting = false;
                if (!speechState.shouldListen || state.interviewSubmitting) return;
                if (speechRestartableErrors.has(error)) {
                    setSpeechUI({ listening: true, message: 'Yenidən qoşulur...' });
                    restartSpeechRecognition(300);
                    return;
                }
                stopSpeechToText({ keepMessage: false, preserveText: true });
            }

            function handleSpeechEnd() {
                speechState.isStarting = false;
                if (!speechState.shouldListen || state.interviewSubmitting) return;
                restartSpeechRecognition(150);
            }

            function updateTextareaFromSpeechState() {
                const ta = currentAnswerElement();
                if (!ta) return;
                const value = buildAnswerValue(speechState.baseText, speechState.finalText, speechState.interimText);
                if (ta.value !== value) ta.value = value;
            }

            function attachTextareaEditHandler() {
                const ta = currentAnswerElement();
                if (!ta || ta.__silentInterviewBound) return;
                ta.__silentInterviewBound = true;
                ta.addEventListener('input', () => {
                    if (!state.interviewDraft) return;
                    setSpeechFromTextarea(ta.value, { preserveFinal: false });
                });
            }
            function renderNav(role) {
                document.getElementById('nav').innerHTML = NAV[role].map(item => `
        <button class="nav-link ${state.activeNav === item.key ? 'active' : ''}" data-nav="${item.key}">
          <span class="mr-3 inline-flex w-5 text-center">${ICONS[item.key] || '•'}</span> ${t('nav_' + item.key)}
        </button>`).join('');
                document.querySelectorAll('[data-nav]').forEach(btn => btn.onclick = () => {
                    state.activeNav = btn.getAttribute('data-nav');
                    renderContent(role);
                    renderNav(role);

                    // Close sidebar on mobile
                    const sidebar = document.getElementById('sidebar');
                    const overlay = document.getElementById('sidebarOverlay');
                    if (window.innerWidth < 1024 && !sidebar.classList.contains('-translate-x-full')) {
                        sidebar.classList.add('-translate-x-full');
                        overlay.classList.add('hidden');
                    }
                });
            }

            function renderContent(role) {
                const c = document.getElementById('content'); c.className = 'space-y-6 fade-in w-full max-w-full overflow-hidden';
                if (role === 'RECRUITER') {
                    if (state.activeNav === 'dashboard') c.innerHTML = recruiterDashboard();
                    else if (state.activeNav === 'jobs') c.innerHTML = recruiterJobs();
                    else if (state.activeNav === 'training') c.innerHTML = recruiterTraining();
                    else if (state.activeNav === 'candidates') c.innerHTML = recruiterCandidates();
                    else if (state.activeNav === 'analytics') c.innerHTML = recruiterAnalytics();
                    else if (state.activeNav === 'settings') c.innerHTML = recruiterSettings();
                    bindRecruiter();
                } else {
                    if (state.activeNav === 'available') c.innerHTML = candidateAvailable();
                    else if (state.activeNav === 'results') c.innerHTML = candidateResults();
                    else if (state.activeNav === 'reports') c.innerHTML = candidateReports();
                    else if (state.activeNav === 'profile') c.innerHTML = candidateProfile();
                    else if (state.activeNav === 'interview') c.innerHTML = premiumInterviewView();
                    bindCandidate();
                }
                requestAnimationFrame(renderCharts);
            }

            function recruiterDashboard() {
                const jobList = jobs();
                const appList = apps().filter(a => jobList.some(j => j.id === a.jobId));
                const interviewList = interviews().filter(i => jobList.some(j => j.id === i.jobId));
                return `
        <section class="grid gap-4 grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
          ${[{ l: t('active_jobs'), v: jobList.length, i: '⌘' }, { l: t('candidates_count'), v: new Set(appList.map(a => a.candidateId)).size, i: '◌' }, { l: t('interviews_completed'), v: interviewList.length, i: '◉' }, { l: t('shortlisted_count'), v: appList.filter(a => ['SHORTLISTED', 'QUALIFIED'].includes(a.status)).length, i: '✓' }].map(s => `
            <div class="glass rounded-[28px] p-5 sm:p-6 stat-card hover:-translate-y-1 transition-transform">
              <div class="flex items-center justify-between text-xs sm:text-sm" style="color: var(--muted);"><span class="truncate pr-2">${s.l}</span> <span class="text-lg sm:text-xl shrink-0" style="color: var(--accent);">${s.i}</span></div>
              <div class="mt-2 sm:mt-3 text-2xl sm:text-4xl font-black">${s.v}</div>
            </div>`).join('')}
        </section>
        <section class="grid gap-6 xl:grid-cols-[1.25fr_.75fr] w-full">
          <div class="glass rounded-[28px] p-5 sm:p-6 w-full overflow-hidden">
            <h2 class="text-xl sm:text-2xl font-black mb-4 section-title">${t('hiring_funnel')}</h2>
            <div class="h-64 sm:h-80 w-full relative"><canvas id="funnelChart"></canvas></div>
          </div>
          <div class="glass rounded-[28px] p-5 sm:p-6 w-full overflow-hidden">
            <h2 class="text-xl sm:text-2xl font-black mb-4 section-title">${t('top_candidates')}</h2>
            <div class="space-y-3">
              ${appList.length ? [...appList].sort((a, b) => b.interviewScore - a.interviewScore).slice(0, 5).map(a => `<div class="glass-strong rounded-[24px] p-4 flex justify-between items-center hover:scale-[1.01] transition-transform text-sm sm:text-base"><div class="font-bold truncate pr-3">${users().find(u => u.id === a.candidateId)?.name}</div><div class="text-[var(--accent)] font-black shrink-0">${a.interviewScore || 0}%</div></div>`).join('') : `<div class="empty-state">${t('no_candidates')}</div>`}
            </div>
          </div>
        </section>
      `;
            }

            function recruiterJobs() {
                const mine = jobs();
                const search = state.searchQuery.toLowerCase();
                const filtered = search ? mine.filter(j => j.title.toLowerCase().includes(search) || j.department.toLowerCase().includes(search) || j.skillsRequired.toLowerCase().includes(search)) : mine;

                return `
        <section class="glass rounded-[28px] p-5 sm:p-6"><h2 class="text-xl sm:text-2xl font-black section-title mb-4">${t('create_job')}</h2>
          <form id="jobForm" class="grid gap-4 md:grid-cols-2">
            <input class="input" name="title" placeholder="${t('job_title')}" required> <input class="input" name="department" placeholder="${t('department')}" required>
            <input class="input" name="experienceLevel" placeholder="${t('experience_level')}" required> <input class="input" name="skillsRequired" placeholder="${t('skills_required')}" required>
            <input class="input" name="companyCulture" placeholder="${t('company_culture')}" required>
            <div class="flex gap-3 sm:gap-4 flex-col sm:flex-row">
                <input class="input" name="minPassingScore" type="number" value="70" placeholder="${t('min_score')}">
                <input class="input" name="interviewDuration" type="number" value="20" placeholder="${t('duration_min')}">
            </div>
            <select class="select" name="template"><option>STARTUP</option><option>GOOGLE</option><option>CUSTOM</option></select>
            <button class="btn btn-primary md:col-span-2 mt-2" type="submit" id="jobSubmitBtn"><span id="jobBtnText">${t('generate_ai_interview')}</span><span id="jobBtnLoader" class="loader hidden-i"></span></button>
          </form>
        </section>
        <section class="glass rounded-[28px] p-5 sm:p-6">
          <div class="flex items-center justify-between gap-4 flex-wrap mb-4">
            <h2 class="text-xl sm:text-2xl font-black section-title">${t('your_jobs')} (${filtered.length})</h2>
            <input type="text" id="jobSearch" class="input max-w-xs w-full sm:w-auto" placeholder="${t('search_jobs')}" value="${state.searchQuery}">
          </div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            ${filtered.map(j => `<div class="glass-strong rounded-[26px] p-5 relative group hover:scale-[1.01] transition-transform"><button class="absolute top-4 right-4 sm:opacity-0 group-hover:opacity-100 btn btn-secondary px-2 py-1 text-xs" data-delete-job="${j.id}">🗑</button><h3 class="text-lg sm:text-xl font-bold pr-6">${j.title}</h3><p class="text-xs sm:text-sm text-[var(--muted)]">${j.department}</p><p class="mt-2 text-xs" style="color:var(--muted)">${t('skills_label')} ${j.skillsRequired}</p></div>`).join('')}
          </div>
        </section>
      `;
            }

            function recruiterTraining() {
                const mineJobs = jobs();
                const mineTraining = trainings();
                return `
        <section class="glass rounded-[28px] p-5">
          <h2 class="text-xl sm:text-2xl font-black">${t('ai_training')}</h2>
          <p class="text-sm mt-1" style="color: var(--muted);">${t('training_desc')}</p>
          <form id="trainingForm" class="mt-5 grid gap-4 md:grid-cols-2">
            <select class="select" name="jobId" required>
              ${mineJobs.map(j => `<option value="${j.id}">${j.title}</option>`).join('')}
            </select>
            <input class="input" type="file" name="file" accept=".pdf,.doc,.docx,.txt" required>
            <select class="select" name="fileType">
              <option>PDF</option><option>DOCX</option><option>TXT</option><option>Notes</option>
            </select>
            <button class="btn btn-primary" type="submit" id="trainSubmitBtn">
              <span id="trainBtnText">${t('upload_train')}</span>
              <span id="trainBtnLoader" class="loader hidden-i"></span>
            </button>
          </form>
        </section>

        <section class="space-y-3">
          ${mineTraining.length ? mineTraining.map(tr => {
                    const job = jobs().find(j => j.id === tr.jobId);
                    return `
              <div class="glass-strong rounded-[26px] p-4 sm:p-5 hover:scale-[1.01] transition-transform duration-200">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 shrink-0 rounded-xl grid place-items-center" style="background: rgba(139,92,246,.12); font-size: 20px;">📄</div>
                    <div>
                      <div class="font-semibold text-sm sm:text-base">${job?.title || t('training_session')}</div>
                      <div class="text-xs sm:text-sm" style="color: var(--muted);">${tr.fileName} · ${tr.fileType}</div>
                    </div>
                  </div>
                  <div class="text-right ml-auto">
                    <div class="font-black" style="color: var(--accent);">${tr.progress}%</div>
                    <div class="text-xs" style="color: var(--muted);">${t(tr.status.toLowerCase()) || tr.status}</div>
                  </div>
                </div>
                <div class="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div class="h-full rounded-full ${tr.progress < 100 ? 'shimmer' : ''}" style="width:${tr.progress}%; background: linear-gradient(135deg, var(--accent), var(--accent2)); transition: width 1s ease;"></div>
                </div>
                <div class="mt-3 text-xs sm:text-sm" style="color: var(--muted);">${tr.summary || tr.status}</div>
                ${tr.progress === 100 ? `<button class="btn btn-secondary mt-3 text-xs" data-delete-training="${tr.id}">${t('remove')}</button>` : ''}
              </div>
            `;
                }).join('') : `<div class="glass rounded-[28px] p-5 empty-state"><div class="empty-state-icon">◫</div><div class="text-sm font-semibold">${t('no_training')}</div><div class="text-xs mt-1" style="color: var(--muted);">${t('training_empty_desc')}</div></div>`}
        </section>
      `;
            }

            function recruiterCandidates() {
                return `
        <section class="glass rounded-[28px] p-5">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 class="text-xl sm:text-2xl font-black">${t('candidate_management')}</h2>
              <p class="text-xs sm:text-sm mt-1" style="color: var(--muted);">${t('candidate_desc')}</p>
            </div>
            <div class="auth-chip text-xs">${t('auto_threshold')}</div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            ${['ALL', 'ABOVE THRESHOLD', 'REJECTED', 'PENDING', 'SHORTLISTED', 'QUALIFIED'].map(f => `<button class="btn btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm ${state.candidateFilter === f ? 'ring-2 ring-cyan-400/30' : ''}" data-filter="${f}">${t('filter_' + f.toLowerCase().replace(' ', '_')) || f}</button>`).join('')}
          </div>

          <div class="mt-4 table-wrap">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left" style="color: var(--muted);">
                  <th class="py-3 px-3 cursor-pointer hover:text-[var(--text)] transition-colors whitespace-nowrap" data-sort="name">${t('col_candidate')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_job')}</th>
                  <th class="py-3 px-3 cursor-pointer hover:text-[var(--text)] transition-colors whitespace-nowrap" data-sort="score">${t('col_score')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_confidence')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_stress')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_communication')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_technical')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_culture')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_status')}</th>
                </tr>
              </thead>
              <tbody id="candidateRows"></tbody>
            </table>
          </div>
        </section>
      `;
            }

            function recruiterAnalytics() {
                const appData = apps();
                const avgScore = avg(appData.map(a => a.interviewScore || 0));
                const shortlistRate = appData.length ? Math.round(appData.filter(a => ['SHORTLISTED', 'QUALIFIED'].includes(a.status)).length / appData.length * 100) : 0;
                return `
        <section class="grid gap-4 md:grid-cols-3">
          <div class="glass rounded-[28px] p-5 hover:-translate-y-1 transition-transform duration-300"><div class="text-sm" style="color: var(--muted);">${t('avg_score')}</div><div class="mt-2 sm:mt-3 text-3xl sm:text-4xl font-black">${avgScore}%</div></div>
          <div class="glass rounded-[28px] p-5 hover:-translate-y-1 transition-transform duration-300"><div class="text-sm" style="color: var(--muted);">${t('shortlist_rate')}</div><div class="mt-2 sm:mt-3 text-3xl sm:text-4xl font-black">${shortlistRate}%</div></div>
          <div class="glass rounded-[28px] p-5 hover:-translate-y-1 transition-transform duration-300"><div class="text-sm" style="color: var(--muted);">${t('total_candidates')}</div><div class="mt-2 sm:mt-3 text-3xl sm:text-4xl font-black">${appData.length}</div></div>
        </section>
        <section class="glass rounded-[28px] p-5 w-full overflow-hidden">
          <h2 class="text-xl sm:text-2xl font-black mb-4">${t('analytics')}</h2>
          <div class="mt-5 grid gap-4 lg:grid-cols-2">
            <div class="glass-strong rounded-[26px] p-4 h-64 sm:h-80 w-full relative"><canvas id="barChart"></canvas></div>
            <div class="glass-strong rounded-[26px] p-4 h-64 sm:h-80 w-full relative"><canvas id="pieChart"></canvas></div>
          </div>
        </section>
      `;
            }

            function recruiterSettings() {
                const u = currentUser();
                return `
        <section class="glass rounded-[28px] p-5">
          <h2 class="text-xl sm:text-2xl font-black">${t('settings')}</h2>
          <form id="settingsForm" class="mt-5 grid gap-4 md:grid-cols-2">
            <div><label class="text-sm font-semibold mb-2 block" style="color: var(--muted);">${t('full_name')}</label><input class="input" name="name" value="${u.name}" required></div>
            <div><label class="text-sm font-semibold mb-2 block" style="color: var(--muted);">${t('email')}</label><input class="input" name="email" value="${u.email}" disabled style="opacity: .6;"></div>
            <div><label class="text-sm font-semibold mb-2 block" style="color: var(--muted);">${t('company')}</label><input class="input" name="company" value="${u.companyName || ''}" ${u.role === 'CANDIDATE' ? 'disabled style="opacity: .6;"' : ''}></div>
            <div><label class="text-sm font-semibold mb-2 block" style="color: var(--muted);">${t('role')}</label><input class="input" value="${u.role}" disabled style="opacity: .6;"></div>
            <div class="md:col-span-2"><button type="submit" class="btn btn-primary mt-2" id="settingsBtn"><span id="settingsBtnText">${t('save_changes')}</span><span id="settingsBtnLoader" class="loader hidden-i"></span></button></div>
          </form>
          <div class="mt-8 border-t pt-6" style="border-color: var(--border);">
            <h3 class="text-lg font-bold mb-4" style="color: var(--bad);">${t('danger_zone')}</h3>
            <div class="glass-strong rounded-[24px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div><div class="font-semibold">${t('delete_account')}</div><div class="text-sm" style="color: var(--muted);">${t('delete_desc')}</div></div>
              <button class="btn btn-danger w-full sm:w-auto shrink-0" onclick="deleteAccount()">${t('delete_account')}</button>
            </div>
          </div>
        </section>
      `;
            }

            function candidateAvailable() {
                const list = jobs();
                const me = currentUser();
                const completedJobs = new Set(apps().filter(a => a.candidateId === me.id).map(a => a.jobId));
                return `<section class="glass rounded-[28px] p-5 sm:p-6"><h2 class="text-xl sm:text-2xl font-black section-title mb-4">${t('available_interviews')}</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${list.map(j => {
                    const isCompleted = completedJobs.has(j.id);
                    return `<div class="glass-strong rounded-[26px] p-5 ${isCompleted ? 'opacity-60' : 'hover:scale-[1.01] transition-transform'} flex flex-col h-full"><h3 class="text-lg sm:text-xl font-bold">${j.title}</h3><p class="text-sm mt-2 mb-4 text-[var(--muted)] flex-1">${j.department}</p><button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} w-full" data-start="${j.id}" ${isCompleted ? 'disabled' : ''}>${isCompleted ? '✓ ' + t('completed') : t('start_interview')}</button></div>`
                }).join('')}
        </div></section>`;
            }

            function candidateResults() {
                const me = currentUser();
                const res = apps().filter(a => a.candidateId === me.id).map(a => ({ ...a, job: jobs().find(j => j.id === a.jobId) }));
                const latest = res[0]?.report || null;
                return `<section class="grid gap-4 grid-cols-2 lg:grid-cols-4">
          ${[[t('eye_contact'), latest?.eyeContact ?? 0, '👁'], [t('col_confidence'), latest?.confidence ?? 0, '💪'], [t('col_stress'), latest?.stress ?? 0, '🧘'], [t('clarity'), latest?.clarity ?? 0, '✨']].map(([l, v, i]) => `
            <div class="glass rounded-[28px] p-4 sm:p-5 stat-card hover:-translate-y-1 transition-transform duration-300">
              <div class="flex items-center justify-between"><div class="text-xs sm:text-sm truncate pr-1" style="color: var(--muted);">${l}</div><span class="shrink-0" style="font-size: 18px;">${i}</span></div>
              <div class="mt-2 sm:mt-3 text-2xl sm:text-4xl font-black">${v}%</div>
            </div>`).join('')}
        </section>
        <section class="glass rounded-[28px] p-5">
          <h2 class="text-xl sm:text-2xl font-black">${t('ai_feedback')}</h2>
          <div class="mt-4 glass-strong rounded-[24px] p-4 sm:p-5"><p class="leading-7 text-sm sm:text-lg">${latest?.feedback || t('no_results_yet')}</p></div>
        </section>
        <section class="glass rounded-[28px] p-5"><h2 class="text-xl sm:text-2xl font-black">${t('past_results')}</h2>
          <div class="mt-4 space-y-3">
            ${res.length ? res.map(r => `<div class="glass-strong rounded-[24px] p-4 flex items-center justify-between text-sm sm:text-base"><div class="font-semibold truncate pr-3">${r.job?.title || 'Job'}</div><div class="font-black text-[var(--accent)] shrink-0">${r.interviewScore || 0}%</div></div>`).join('') : `<div class="empty-state">${t('no_results_yet')}</div>`}
          </div>
        </section>`;
            }

            function candidateReports() {
                const me = currentUser(); const res = apps().filter(a => a.candidateId === me.id);
                return `<section class="glass rounded-[28px] p-5"><h2 class="text-xl sm:text-2xl font-black">${t('reports')}</h2><div class="mt-4 space-y-3">
            ${res.length ? res.map(r => `<div class="glass-strong rounded-[24px] p-4 flex items-center justify-between"><div class="font-semibold text-sm sm:text-base truncate pr-3">${jobs().find(j => j.id === r.jobId)?.title || 'Job'}</div><button class="btn btn-secondary text-xs sm:text-sm" data-download="${r.id}">${t('download')}</button></div>`).join('') : `<div class="empty-state">${t('no_reports_yet')}</div>`}
          </div></section>`;
            }

            function candidateProfile() {
                const u = currentUser();
                return `<section class="glass rounded-[28px] p-5"><h2 class="text-xl sm:text-2xl font-black">${t('profile')}</h2><div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div class="glass-strong rounded-[24px] p-4"><div class="text-sm" style="color: var(--muted);">${t('full_name')}</div><div class="mt-1 font-semibold truncate">${u.name}</div></div>
            <div class="glass-strong rounded-[24px] p-4"><div class="text-sm" style="color: var(--muted);">${t('email')}</div><div class="mt-1 font-semibold truncate">${u.email}</div></div>
            <div class="glass-strong rounded-[24px] p-4 sm:col-span-2"><div class="text-sm" style="color: var(--muted);">${t('role')}</div><div class="mt-1 font-semibold">${u.role}</div></div>
          </div></section>`;
            }

            // ===== YENİLƏNMİŞ İMMERSİV MÜSAHİBƏ GÖRÜNÜŞÜ =====
            function interviewView() {
                const d = state.interviewDraft;
                if (!d) return `<div class="glass rounded-[28px] p-5 empty-state"><div class="empty-state-icon">⚠</div><div class="text-sm font-semibold">${t('no_interview_loaded')}</div></div>`;

                return `
        <section class="immersive-interview glass rounded-[34px] overflow-hidden relative flex flex-col w-full h-[100dvh] min-h-screen border-none">
            <!-- Fullscreen Camera Background -->
            <video id="camVideo" autoplay playsinline muted class="absolute inset-0 w-full h-full object-cover z-0"></video>
            
            <div id="camPlaceholder" class="absolute inset-0 z-0 bg-black/90 flex items-center justify-center flex-col text-white">
                 <div class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl" style="background: rgba(99,102,241,.16);">📷</div>
                 <div class="text-lg font-bold">${t('cam_required')}</div>
                 <div class="text-sm opacity-70 mt-2">${t('press_start')}</div>
            </div>

            <!-- Top Gradient Overlay (for Header & Stats) -->
            <div class="absolute top-0 left-0 right-0 p-5 z-10 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start pointer-events-none">
                <div class="flex items-center gap-3">
                    <div class="auth-chip border-white/20 bg-black/40 text-white shadow-xl backdrop-blur-md pointer-events-auto">
                        <span class="dot pulse"></span> ${t('live')}
                    </div>
                </div>
                <div class="flex items-start gap-4 pointer-events-auto">
                    <!-- Live Stats over Camera -->
                    <div class="flex gap-3">
                        <div class="glass-strong bg-black/40 border-white/10 rounded-2xl p-2 px-3 text-center text-white backdrop-blur-md min-w-[70px]">
                            <div class="text-[9px] uppercase tracking-wider opacity-70">${t('eye_contact')}</div>
                            <div id="liveEye" class="font-black mt-0.5">82%</div>
                        </div>
                        <div class="glass-strong bg-black/40 border-white/10 rounded-2xl p-2 px-3 text-center text-white backdrop-blur-md min-w-[70px]">
                            <div class="text-[9px] uppercase tracking-wider opacity-70 mb-1">${t('speech_level')}</div>
                            <div class="h-1.5 w-12 mx-auto rounded-full bg-white/20 overflow-hidden">
                                <div id="micLevelBar" class="h-full rounded-full" style="width: 15%; background: linear-gradient(135deg, var(--accent), var(--accent2)); transition: width .1s ease;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="glass-strong bg-black/40 border-white/10 rounded-2xl p-2 px-4 text-center text-white backdrop-blur-md">
                        <div class="text-[10px] uppercase tracking-wider opacity-70">${t('time_left')}</div>
                        <div id="timerLabel" class="font-mono text-xl font-bold mt-0.5">00:00</div>
                    </div>
                    
                    <button class="btn btn-secondary border-white/20 bg-black/40 text-white hover:bg-white/10 backdrop-blur-md" onclick="saveInterviewDraft()">💾 ${t('save_draft')}</button>
                </div>
            </div>

            <!-- Bottom Immersive Question Panel -->
            <div class="mt-auto relative z-10 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-32 pb-6 px-6 sm:px-10">
                <div class="max-w-4xl mx-auto w-full flex flex-col gap-4">
                    
                    <!-- Question Display -->
                    <div class="mb-2 text-white">
                        <span class="text-[var(--accent)] font-bold text-xs tracking-[0.2em] uppercase bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
                            ${t('question')} <span id="qIdxLabel">1</span> / ${d.questions.length}
                        </span>
                        <h3 id="currentQText" class="text-2xl sm:text-3xl lg:text-4xl font-black mt-4 leading-tight text-shadow-lg"></h3>
                    </div>
                    
                    <!-- Active Textarea -->
                    <div class="relative mt-2 group">
                        <textarea id="currentAnswer" class="textarea w-full bg-black/40 border-white/20 text-white placeholder-white/40 focus:border-[var(--accent)] focus:bg-black/60 transition-all duration-300 rounded-[20px] p-5 text-base sm:text-lg resize-none backdrop-blur-md shadow-2xl" placeholder="${t('write_answer_here')}" rows="3"></textarea>
                        <div class="absolute bottom-4 right-5 text-xs opacity-50 text-white pointer-events-none transition-opacity group-focus-within:opacity-100">
                            <span id="charCount">0</span> ${t('chars')}
                        </div>
                    </div>

                    <!-- Navigation Controls -->
                    <div class="flex items-center justify-between mt-4 gap-4">
                        <button id="prevQBtn" class="btn btn-secondary border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed px-4 sm:px-6">← <span class="hidden sm:inline ml-2">${t('prev_question')}</span></button>
                        
                        <!-- Dots indicator -->
                        <div class="flex gap-2.5 items-center" id="qDots"></div>
                        
                        <button id="nextQBtn" class="btn btn-primary shadow-[0_0_25px_rgba(99,102,241,0.3)] px-4 sm:px-6"><span class="hidden sm:inline mr-2">${t('next_question')}</span> →</button>
                        <button id="submitInterviewBtn" class="btn btn-primary shadow-[0_0_25px_rgba(168,85,247,0.30)] px-4 sm:px-6 hidden-i">
                            <span id="submitBtnText">${t('finish_interview')}</span>
                            <span id="submitBtnLoader" class="loader hidden-i"></span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
      `;
            }

            function premiumInterviewView() {
                const d = state.interviewDraft;
                if (!d) return `<div class="glass rounded-[28px] p-5 empty-state"><div class="empty-state-icon">⚠</div><div class="text-sm font-semibold">${t('no_interview_loaded')}</div></div>`;

                return `
        <section class="interview-command-center fixed inset-0 z-[80] h-[100dvh] w-screen overflow-hidden bg-slate-950 text-slate-100">
          <div class="interview-ambient" aria-hidden="true"></div>

          <header class="interview-topbar">
            <div class="flex min-w-0 items-center gap-3">
              <div class="live-orb"><span></span></div>
              <div class="min-w-0">
                <p class="telemetry-kicker">LIVE AI TELEMETRY</p>
                <p class="truncate text-sm font-semibold text-white">${d.job.title}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="telemetry-chip hidden sm:flex">
                <span class="text-slate-400">${t('time_left')}</span>
                <span id="timerLabel" class="font-mono font-bold" style="color: var(--accent);">00:00</span>
              </div>
              <button class="telemetry-action" onclick="saveInterviewDraft()">⌘ <span class="hidden sm:inline">${t('save_draft')}</span></button>
              <button class="telemetry-action" onclick="exitInterview()" aria-label="${t('cancel')}">× <span class="hidden sm:inline">${t('cancel')}</span></button>
            </div>
          </header>

          <div class="interview-grid">
            <aside class="telemetry-rail telemetry-scroll" aria-label="Real time interview telemetry">
              <div class="telemetry-rail-head">
                <div>
                  <p class="telemetry-kicker">AI MÜSAHİBƏÇİ</p>
                  <h2>${d.job.title}</h2>
                </div>
                <span id="aiProctorPill" class="ai-proctor-pill ok"><i></i><span id="proctorStatus">AI Proctor: Aktiv</span></span>
              </div>

              <article class="telemetry-card audio-capture-card">
                <div class="telemetry-card-title">
                  <div>
                    <p>CANLI SƏS</p>
                    <span>Danışdıqca mətnə çevrilir</span>
                  </div>
                  <button id="speechToggleBtn" class="speech-toggle" type="button"><span id="speechToggleIcon">●</span><span id="speechToggleLabel">Danış</span></button>
                </div>
                <div id="speechSpectrum" class="speech-spectrum" aria-label="Live speech spectrum">
                  <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                </div>
                <div class="mic-meter"><i id="micLevelBar"></i></div>
                <div id="sttStatus" class="stt-status">Mətnə çevirmə hazır</div>
              </article>

              <div class="side-question-workspace">
                <div class="question-glass">
                  <div class="question-meta">
                    <span>${t('question')} <b id="qIdxLabel">1</b> / ${d.questions.length}</span>
                    <span id="answerReadiness">STAR hazırlığı 0%</span>
                  </div>
                  <h1 id="currentQText"></h1>
                </div>

                <div id="answerShell" class="answer-shell" style="--answer-accent:#8b5cf6;--answer-progress:0%;">
                  <textarea id="currentAnswer" class="star-answer" placeholder="${t('write_answer_here')}" rows="5"></textarea>
                  <div class="answer-status"><span>CAVAB REDAKTORU</span><span><b id="charCount">0</b> ${t('chars')}</span></div>
                </div>

                <div class="answer-send-row">
                  <button id="submitAnswerBtn" class="speech-submit" type="button">Cavabı Göndər</button>
                  <span id="answerDeliveryStatus"></span>
                </div>

                <div class="question-controls">
                  <button id="prevQBtn" class="stage-button secondary">← <span>${t('prev_question')}</span></button>
                  <div id="qDots" class="question-dots" aria-label="Question progress"></div>
                  <button id="nextQBtn" class="stage-button primary"><span>${t('next_question')}</span> →</button>
                  <button id="submitInterviewBtn" class="stage-button primary hidden-i">
                    <span id="submitBtnText">${t('finish_interview')}</span><span id="submitBtnLoader" class="loader hidden-i"></span>
                  </button>
                </div>
              </div>
            </aside>

            <main id="candidateStage" class="candidate-stage">
              <video id="camVideo" autoplay playsinline muted class="candidate-camera"></video>
              <div id="camPlaceholder" class="camera-placeholder">
                <div class="camera-placeholder-icon">◉</div>
                <h3>${t('cam_required')}</h3>
                <p>${t('press_start')}</p>
              </div>
              <div id="proctorToast" class="camera-proctor-toast hidden-i" role="status"></div>
            </main>
          </div>
        </section>`;
            }

            function responseTelemetry() {
                const d = state.interviewDraft;
                const answer = d?.answers?.[state.currentQIdx] || '';
                const text = answer.toLowerCase();
                const markers = ['situation', 'task', 'action', 'result', 'problem', 'goal', 'impact', 'outcome'];
                const markerCount = markers.filter(marker => text.includes(marker)).length;
                const lengthScore = clamp(Math.round((answer.length / 320) * 70), 0, 70);
                return {
                    answer,
                    progress: clamp(Math.round((answer.length / 320) * 100), 0, 100),
                    star: clamp(lengthScore + markerCount * 8, 0, 100),
                    wpm: mic.level > 12 ? clamp(Math.round(74 + mic.level * .86), 74, 176) : 0
                };
            }

            function renderResponseTelemetry() {
                const data = responseTelemetry();
                const hue = Math.round(268 - data.progress * 1.16);
                const accent = `hsl(${hue} 82% 62%)`;
                const shell = document.getElementById('answerShell');
                const textarea = document.getElementById('currentAnswer');
                const count = document.getElementById('charCount');
                const star = document.getElementById('starMetric');
                const readiness = document.getElementById('answerReadiness');
                const wpm = document.getElementById('wpmMetric');
                const pace = document.getElementById('paceLabel');

                if (shell) { shell.style.setProperty('--answer-accent', accent); shell.style.setProperty('--answer-progress', `${data.progress}%`); }
                if (textarea) textarea.style.boxShadow = `0 0 0 1px color-mix(in srgb, ${accent} 56%, transparent), 0 18px 42px color-mix(in srgb, ${accent} 18%, transparent)`;
                if (count) count.textContent = data.answer.length;
                if (star) star.textContent = `${data.star}%`;
                if (readiness) readiness.textContent = `STAR readiness ${data.star}%`;
                if (wpm) wpm.textContent = data.wpm ? `${data.wpm} WPM` : '—';
                if (pace) pace.textContent = data.wpm ? (data.wpm >= 95 && data.wpm <= 155 ? 'Balanced pace' : data.wpm > 155 ? 'Fast delivery' : 'Measured pace') : 'Awaiting voice';
            }

            function renderLiveTelemetry(signal = {}) {
                const m = window.interviewMetrics || {};
                const focus = clamp(Number(signal.focus ?? m.latestFocus ?? 0), 0, 100);
                const stress = clamp(Number(signal.stress ?? m.latestStress ?? 0), 0, 100);
                const happy = clamp(Number(signal.happy ?? m.latestHappy ?? 0), 0, 100);
                const setWidth = (id, value) => { const el = document.getElementById(id); if (el) el.style.width = `${value}%`; };
                const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };

                setWidth('eyeTrackingLine', focus);
                setWidth('valenceBar', happy);
                setWidth('stressBar', stress);
                setText('eyeMapValue', `${focus}%`);
                setText('valenceValue', `${happy}%`);
                setText('stressValue', `${stress}%`);
                const wave = document.getElementById('emotionWave');
                const spectrum = document.getElementById('speechSpectrum');
                if (wave) wave.style.setProperty('--wave-energy', String(Math.max(happy, stress) / 100));
                if (spectrum) spectrum.style.setProperty('--signal-strength', String((mic.level || 0) / 100));
                const hint = document.getElementById('telemetryHint');
                if (hint) hint.textContent = focus < 35 ? 'Camera focus is searching for a stable face signal.' : stress > 60 ? 'Stress signal elevated — take a brief breath before continuing.' : happy > 45 ? 'Positive valence is stable. Keep your delivery measured and clear.' : 'Signals are stable. Add a concrete action and result to strengthen STAR fit.';
                renderResponseTelemetry();
            }

            function updateQuestionUI() {

                const d = state.interviewDraft;

                const idx = state.currentQIdx;

                const ans = d.answers[idx] || "";

                document.getElementById("qIdxLabel").textContent = idx + 1;

                document.getElementById("currentQText").textContent = d.questions[idx];

                const ta = document.getElementById("currentAnswer");

                if (ta) {

                    // Mikrofon işləyərkən textarea-nın məzmununu dəyişmə
                    if (!speech.shouldListen) {
                        ta.value = ans;
                    }

                    // Yazı artdıqca avtomatik aşağı sürüşdür
                    ta.scrollTop = ta.scrollHeight;

                }

                renderResponseTelemetry();

                // Buttons
                const prev = document.getElementById("prevQBtn");
                const next = document.getElementById("nextQBtn");
                const submit = document.getElementById("submitInterviewBtn");

                prev.disabled = idx === 0;

                if (idx === d.questions.length - 1) {

                    next.classList.add("hidden-i");
                    submit.classList.remove("hidden-i");

                } else {

                    next.classList.remove("hidden-i");
                    submit.classList.add("hidden-i");

                }

                // Question dots
                document.getElementById("qDots").innerHTML = d.questions.map((_, i) => {

                    let dotClass = "pending";

                    if (i === idx) {

                        dotClass = "active";

                    } else if ((d.answers[i] || "").trim().length > 20) {

                        dotClass = "answered";

                    }

                    return `<i class="question-dot ${dotClass}"></i>`;

                }).join("");

            }

            function setSpeechUI({ listening = false, message = 'Mətnə çevirmə hazır' } = {}) {
                const status = document.getElementById('sttStatus');
                const button = document.getElementById('speechToggleBtn');
                const label = document.getElementById('speechToggleLabel');
                const icon = document.getElementById('speechToggleIcon');
                if (status) { status.textContent = message; status.classList.toggle('listening', listening); }
                if (button) button.classList.toggle('listening', listening);
                if (label) label.textContent = listening ? 'Dayandır' : 'Danış';
                if (icon) icon.textContent = listening ? '■' : '●';
            }

            function syncSpeechTranscript(questionIndex = speech.questionIndex) {

                const d = state.interviewDraft;

                const ta = document.getElementById("currentAnswer");

                if (!d || questionIndex !== state.currentQIdx) return;

                const fullText = (
                    speech.baseText +
                    speech.finalText +
                    speech.interimText
                )
                    .replace(/\s+/g, " ")
                    .trim();

                d.answers[questionIndex] = fullText;

                if (ta) {
                    ta.value = fullText;
                    ta.scrollTop = ta.scrollHeight;
                }

                renderResponseTelemetry();
            }

            function getCurrentSpeechLang() {
                return speechLanguageFor(currentLang);
            }

            function syncSpeechUiLanguage() {
                if (speech.recognition) {
                    try {
                        speech.recognition.lang = getCurrentSpeechLang();
                    } catch { }
                }
            }

            function commitSpeechToAnswer() {
                const d = state.interviewDraft;
                if (!d || speech.questionIndex < 0) return;
                const idx = speech.questionIndex;
                if (idx !== state.currentQIdx) return;
                const base = String(speech.baseText || '');
                const finalText = String(speech.finalText || '');
                const interimText = String(speech.interimText || '');
                const merged = `${base}${finalText}${interimText}`.replace(/\s+/g, ' ').trim();
                d.answers[idx] = merged;
                const ta = document.getElementById('currentAnswer');
                if (ta && state.currentQIdx === idx) ta.value = merged;
                renderResponseTelemetry();
            }

            function updateSpeechAnswer(text, { final = false } = {}) {
                const d = state.interviewDraft;
                if (!d || speech.questionIndex < 0) return;
                const idx = speech.questionIndex;
                if (idx !== state.currentQIdx) return;
                if (final) {
                    speech.finalText = `${speech.finalText}${text ? `${text} ` : ''}`;
                    speech.interimText = '';
                } else {
                    speech.interimText = String(text || '');
                }
                commitSpeechToAnswer();
            }

            function scheduleSpeechRestart(delay = 250) {
                clearTimeout(speech.restartTimer);
                if (!speech.shouldListen || !state.interviewDraft || state.activeNav !== 'interview' || state.interviewSubmitting) return;
                speech.restartTimer = setTimeout(() => {
                    speech.restartTimer = null;
                    startSpeechToText();
                }, delay);
            }

            function stopSpeechToText({ keepMessage = false, discardInstance = false, suppressRestart = true } = {}) {
                speech.shouldListen = false;
                speech.isStarting = false;
                if (suppressRestart) clearTimeout(speech.restartTimer);
                speech.restartTimer = null;
                clearTimeout(speech.silenceTimer); speech.silenceTimer = null;
                const recognition = speech.recognition;
                if (recognition) {
                    try {
                        recognition.onstart = null;
                        recognition.onresult = null;
                        recognition.onerror = null;
                        recognition.onend = null;
                        recognition.onnomatch = null;
                        recognition.stop();
                    } catch { }
                    try { recognition.abort(); } catch { }
                }
                if (discardInstance && recognition) {
                    speech.recognition = null;
                }
                speech.finalText = '';
                speech.interimText = '';
                speech.baseText = '';
                speech.questionIndex = -1;
                if (!keepMessage) setSpeechUI();
            }

            function ensureSpeechInstance() {
                const SpeechRecognition = getSpeechRecognitionConstructor();
                if (!SpeechRecognition) return null;
                if (speech.recognition) return speech.recognition;
                const recognition = new SpeechRecognition();
                recognition.lang = getCurrentSpeechLang();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.maxAlternatives = 1;
                recognition.onstart = () => {
                    speech.isStarting = false;
                    setSpeechUI({ listening: true, message: 'Dinləyir və mətnə çevirir' });
                };
                recognition.onresult = handleSpeechResult;
                recognition.onerror = handleSpeechError;
                recognition.onend = handleSpeechEnd;
                recognition.onnomatch = () => {
                    if (speech.shouldListen && !state.interviewSubmitting) scheduleSpeechRestart(150);
                };
                speech.recognition = recognition;
                return recognition;
            }

            function startSpeechToText() {
                const recognition = ensureSpeechInstance();
                const d = state.interviewDraft;

                if (!recognition) {
                    setSpeechUI({ message: 'Bu brauzerdə səsdən-mətnə çevirmə dəstəklənmir' });
                    toast('Bu brauzerdə Speech-to-Text dəstəklənmir.', 'warn');
                    return;
                }

                if (!d || state.activeNav !== 'interview' || state.interviewSubmitting) return;
                if (speech.isStarting) return;

                syncSpeechUiLanguage();
                speech.baseText = String(d.answers[state.currentQIdx] || '').trim();
                speech.finalText = '';
                speech.interimText = '';
                speech.shouldListen = true;
                speech.questionIndex = state.currentQIdx;
                speech.isStarting = true;

                try {
                    recognition.start();
                } catch (error) {
                    speech.isStarting = false;
                    const name = String(error?.name || error?.message || '').toLowerCase();
                    if (name.includes('invalidstate')) scheduleSpeechRestart(250);
                }
            }

            function handleSpeechResult(event) {
                if (!speech.shouldListen || !state.interviewDraft || state.interviewSubmitting) return;
                let nextFinal = '';
                let nextInterim = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    const transcript = String(result?.[0]?.transcript || '');
                    if (!transcript) continue;
                    if (result.isFinal) nextFinal += `${transcript} `;
                    else nextInterim += transcript;
                }

                if (nextFinal) {
                    speech.finalText = `${speech.finalText}${nextFinal}`.replace(/\s+/g, ' ').trim();
                    speech.interimText = '';
                }
                if (nextInterim !== '') {
                    speech.interimText = nextInterim;
                }
                commitSpeechToAnswer();

                clearTimeout(speech.silenceTimer);
                speech.silenceTimer = setTimeout(() => {
                    if (speech.shouldListen && state.interviewDraft && !state.interviewSubmitting && state.activeNav === 'interview') {
                        submitCurrentAnswer('silence');
                    }
                }, 3000);
            }

            function handleSpeechError(event) {
                const error = String(event?.error || event?.name || 'unknown').toLowerCase();
                speech.isStarting = false;

                if (!speech.shouldListen || state.interviewSubmitting) return;

                if (error === 'not-allowed' || error === 'service-not-allowed') {
                    stopSpeechToText({ keepMessage: false, discardInstance: false, suppressRestart: true });
                    toast('Mikrofon icazəsi tələb olunur.', 'error');
                    return;
                }

                if (['network', 'no-speech', 'audio-capture', 'aborted'].includes(error)) {
                    scheduleSpeechRestart(250);
                    return;
                }
            }

            function handleSpeechEnd() {
                speech.isStarting = false;
                if (!speech.shouldListen || state.interviewSubmitting || !state.interviewDraft || state.activeNav !== 'interview') {
                    return;
                }
                scheduleSpeechRestart(150);
            }

            function persistInterviewDraft(force = true) {
                const d = state.interviewDraft;
                if (!d) return;
                commitSpeechToAnswer();
                const me = currentUser();
                if (!me) return;
                if (!force && !document.hidden) return;
                const drafts = load(LS.drafts, {});
                drafts[`${me.id}_${d.jobId}`] = {
                    answers: d.answers,
                    timer: d.timer,
                    savedAt: new Date().toISOString(),
                };
                save(LS.drafts, drafts);
            }

            function restoreInterviewDraftState() {
                const d = state.interviewDraft;
                if (!d) return;
                const ta = document.getElementById('currentAnswer');
                if (ta) ta.value = String(d.answers[state.currentQIdx] || '');
                const timerLabel = document.getElementById('timerLabel');
                if (timerLabel) {
                    timerLabel.textContent = `${String(Math.floor(d.timer / 60)).padStart(2, '0')}:${String(d.timer % 60).padStart(2, '0')}`;
                }
            }

            function onSpeechLangMaybeChanged() {
                syncSpeechUiLanguage();
            }

            window.addEventListener('silentInterview:language-changed', onSpeechLangMaybeChanged);

            // ===== RENDER SYSTEM =====
            window.render = function () {
                const u = currentUser();
                if (!u && state.view !== 'auth') state.view = 'landing';
                if (u) state.view = 'app';
                if (state.view === 'landing') renderLanding();
                else if (state.view === 'auth') { renderLanding(); renderAuthModal(); bindLanding(); }
                else renderApp();

                applyTranslations();
            }

            function renderLanding() {
                document.getElementById('app').innerHTML = document.getElementById('tpl-landing').innerHTML;
                document.body.classList.add('grain');
                document.getElementById('year').textContent = new Date().getFullYear();

                document.getElementById('featureGrid').innerHTML = FEATURE_CARDS[currentLang].map((f, idx) => `
        <div class="premium-card rounded-[30px] p-6 stat-card hover:-translate-y-1 transition-all duration-300 fade-up" style="animation-delay:${idx * 40}ms">
          <div class="h-14 w-14 rounded-2xl grid place-items-center text-2xl mb-4 soft-shadow" style="background: linear-gradient(135deg, rgba(79,70,229,.14), rgba(139,92,246,.12));">${f.icon}</div>
          <h3 class="text-xl font-bold font-space">${f.title}</h3>
          <p class="mt-2 text-sm leading-6" style="color: var(--muted);">${f.text}</p>
        </div>
      `).join('');

                document.getElementById('pricingGrid').innerHTML = PRICING[currentLang].map((p, i) => `
        <div class="premium-card rounded-[30px] p-6 ${i === 1 ? 'ring-2 ring-cyan-400/20 relative' : ''} hover:-translate-y-1 transition-all duration-300 cursor-pointer fade-up" style="animation-delay:${i * 60}ms" onclick="selectPlan('${p.name}')">
          ${i === 1 ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2"><span class="pill" style="background: linear-gradient(135deg, rgba(99,102,241,.18), rgba(168,85,247,.14)); color: var(--accent); font-weight: 700; font-size: 10px;">Most Popular</span></div>' : ''}
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-extrabold">${p.name}</h3>
          </div>
          <div class="mt-3 text-3xl sm:text-4xl font-black">${p.price}</div>
          <p class="mt-3 text-sm leading-6" style="color: var(--muted);">${p.desc}</p>
          <ul class="mt-4 space-y-2">
            ${p.features.map(f => `<li class="flex items-start gap-2 text-sm" style="color: var(--muted);"><span style="color: var(--good); margin-top: 1px;">✓</span> <span>${f}</span></li>`).join('')}
          </ul>
          <button class="btn ${i === 1 ? 'btn-primary' : 'btn-secondary'} w-full mt-5" data-open-auth="signup" data-key="get_started_free">${t('get_started_free')}</button>
        </div>
      `).join('');

                document.getElementById('testimonialsGrid').innerHTML = TESTIMONIALS[currentLang].map((t, idx) => `
        <div class="premium-card rounded-[30px] p-6 hover:-translate-y-1 transition-transform duration-300 fade-up" style="animation-delay:${idx * 50}ms">
          <div class="text-2xl mb-3" style="color: var(--accent);">"</div>
          <p class="leading-7 text-sm">${t.quote}</p>
          <div class="mt-4 flex items-center gap-3">
            <div class="h-10 w-10 shrink-0 rounded-full grid place-items-center text-sm font-bold" style="background: linear-gradient(135deg, rgba(99,102,241,.18), rgba(168,85,247,.16));">${t.name.split(' ').map(n => n[0]).join('')}</div>
            <div>
              <div class="text-sm font-semibold">${t.name}</div>
              <div class="text-xs" style="color: var(--muted);">${t.role}, ${t.company}</div>
            </div>
          </div>
        </div>
      `).join('');

                bindLanding();
            }

            window.selectPlan = function (planName) {
                toast(t('msg_plan_selected').replace('{plan}', planName), 'info');
            }

            function bindLanding() {
                document.querySelectorAll('[data-open-auth]').forEach(btn => btn.addEventListener('click', () => { state.authMode = btn.getAttribute('data-open-auth'); state.view = 'auth'; render(); }));
                document.getElementById('mobileOpenBtn')?.addEventListener('click', () => document.getElementById('mobileMenu').classList.toggle('hidden'));

                document.getElementById('demoForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const btnText = document.getElementById('demoBtnText');
                    const btnLoader = document.getElementById('demoBtnLoader');
                    btnText.classList.add('hidden-i');
                    btnLoader.classList.remove('hidden-i');

                    setTimeout(() => {
                        btnText.classList.remove('hidden-i');
                        btnLoader.classList.add('hidden-i');
                        closeDemoModal();
                        toast(t('msg_demo_success'), 'success');
                    }, 700);
                });
            }

            function renderAuthModal() {
                const wrap = document.createElement('div'); wrap.id = 'authOverlay'; wrap.innerHTML = document.getElementById('tpl-auth').innerHTML; document.body.appendChild(wrap);
                const overlay = wrap.querySelector('.auth-shell'); if (overlay) overlay.classList.add('fade-up');
                const titles = [document.getElementById('authTitle'), document.getElementById('authFormTitle')].filter(Boolean);
                const tabLogin = document.getElementById('tabLogin'); const tabSignup = document.getElementById('tabSignup');
                const name = document.getElementById('authName'); const role = document.getElementById('authRole'); const company = document.getElementById('authCompany');
                const nameField = document.getElementById('authNameField'); const roleField = document.getElementById('authRoleField'); const companyField = document.getElementById('authCompanyField');
                function syncMode() {
                    const signup = state.authMode === 'signup';
                    titles.forEach(title => title.textContent = signup ? t('signup') : t('login'));
                    tabLogin.className = `auth-mode-button ${signup ? '' : 'is-active'}`; tabSignup.className = `auth-mode-button ${signup ? 'is-active' : ''}`;
                    nameField.classList.toggle('hidden-i', !signup); roleField.classList.toggle('hidden-i', !signup); companyField.classList.toggle('hidden-i', !signup || role.value !== 'RECRUITER');
                    document.getElementById('authSubmit').querySelector('span:first-child').textContent = signup ? t('btn_signup') : t('btn_login');
                }
                tabLogin.onclick = () => { state.authMode = 'login'; syncMode(); }; tabSignup.onclick = () => { state.authMode = 'signup'; syncMode(); };
                const password = document.getElementById('authPassword');
                password?.addEventListener('input', () => { const meter = document.getElementById('passwordStrength'); if (meter) meter.style.width = Math.min(100, password.value.length * 12) + '%'; });
                role.onchange = syncMode; document.getElementById('closeAuthBtn').onclick = () => { wrap.remove(); state.view = 'landing'; render(); };
                document.getElementById('authEmail')?.addEventListener('input', () => { const el = document.getElementById('authLiveValidation'); if (el) el.textContent = document.getElementById('authEmail').value.includes('@') ? 'Email looks good' : 'Enter a valid email'; });

                document.getElementById('authForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('authEmail').value.trim(); const pass = document.getElementById('authPassword').value;
                    const err = document.getElementById('authError'); err.classList.add('hidden-i');
                    const btnText = document.getElementById('authBtnText'); const btnLoader = document.getElementById('authBtnLoader');
                    btnText.classList.add('hidden-i'); btnLoader.classList.remove('hidden-i');

                    try {
                        let user;
                        if (state.authMode === 'login') {
                            user = await login({ email, password: pass });
                        } else {
                            const fullName = name.value.trim();
                            const selectedRole = role.value;
                            if (!fullName || pass.length < 6) throw new Error(t('msg_err_pass_len'));
                            await register({ fullName, email, password: pass, confirmPassword: pass, role: selectedRole });
                            user = await login({ email, password: pass });
                        }
                        await hydrateRuntimeStore();
                        state.view = 'app'; state.activeNav = user.role === 'RECRUITER' ? 'dashboard' : 'available';
                        wrap.remove(); render();
                        toast(t('msg_welcome').replace('{name}', user.name), 'success');
                    } catch (error) {
                        btnText.classList.remove('hidden-i'); btnLoader.classList.add('hidden-i');
                        err.textContent = error.response?.data?.message || error.message || t('msg_err_login'); err.classList.remove('hidden-i');
                    }
                };
                syncMode();
                applyTranslations();
            }

            window.renderApp = function () {
                document.getElementById('app').innerHTML = document.getElementById('tpl-app').innerHTML;
                document.body.classList.add('grain');
                const u = currentUser(); if (!u) return;
                document.getElementById('userMeta').textContent = `${u.name}`;
                document.getElementById('workspaceName').textContent = u.role === 'RECRUITER' ? t('recruiter_hub') : t('candidate_portal');
                document.getElementById('workspaceDesc').textContent = u.role === 'RECRUITER' ? t('hub_desc') : t('portal_desc');
                document.getElementById('themeToggle').onclick = toggleTheme;

                // Real çıxış funksiyası User profilinə (və ya helper buttona) bağlanır
                document.getElementById('logoutBtnHelper').onclick = () => showConfirm(t('title_logout'), t('msg_logout'), async () => { await logout(); stopMedia(); state.view = 'landing'; render(); }, false);

                // Sidebar Mobile Toggle
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('sidebarOverlay');
                const toggleSidebar = () => {
                    sidebar.classList.toggle('-translate-x-full');
                    overlay.classList.toggle('hidden');
                };
                document.getElementById('sidebarToggle').onclick = toggleSidebar;
                document.getElementById('sidebarCloseBtn').onclick = toggleSidebar;
                overlay.onclick = toggleSidebar;

                renderNav(u.role); renderContent(u.role);
                applyTranslations();
            }

            function renderNav(role) {
                document.getElementById('nav').innerHTML = NAV[role].map(item => `
        <button class="nav-link ${state.activeNav === item.key ? 'active' : ''}" data-nav="${item.key}">
          <span class="mr-3 inline-flex w-5 text-center">${ICONS[item.key] || '•'}</span> ${t('nav_' + item.key)}
        </button>`).join('');
                document.querySelectorAll('[data-nav]').forEach(btn => btn.onclick = () => {
                    state.activeNav = btn.getAttribute('data-nav');
                    renderContent(role);
                    renderNav(role);

                    // Close sidebar on mobile
                    const sidebar = document.getElementById('sidebar');
                    const overlay = document.getElementById('sidebarOverlay');
                    if (window.innerWidth < 1024 && !sidebar.classList.contains('-translate-x-full')) {
                        sidebar.classList.add('-translate-x-full');
                        overlay.classList.add('hidden');
                    }
                });
            }

            function renderContent(role) {
                const c = document.getElementById('content'); c.className = 'space-y-6 fade-in w-full max-w-full overflow-hidden';
                if (role === 'RECRUITER') {
                    if (state.activeNav === 'dashboard') c.innerHTML = recruiterDashboard();
                    else if (state.activeNav === 'jobs') c.innerHTML = recruiterJobs();
                    else if (state.activeNav === 'training') c.innerHTML = recruiterTraining();
                    else if (state.activeNav === 'candidates') c.innerHTML = recruiterCandidates();
                    else if (state.activeNav === 'analytics') c.innerHTML = recruiterAnalytics();
                    else if (state.activeNav === 'settings') c.innerHTML = recruiterSettings();
                    bindRecruiter();
                } else {
                    if (state.activeNav === 'available') c.innerHTML = candidateAvailable();
                    else if (state.activeNav === 'results') c.innerHTML = candidateResults();
                    else if (state.activeNav === 'reports') c.innerHTML = candidateReports();
                    else if (state.activeNav === 'profile') c.innerHTML = candidateProfile();
                    else if (state.activeNav === 'interview') c.innerHTML = premiumInterviewView();
                    bindCandidate();
                }
                requestAnimationFrame(renderCharts);
            }

            function recruiterDashboard() {
                const jobList = jobs();
                const appList = apps().filter(a => jobList.some(j => j.id === a.jobId));
                const interviewList = interviews().filter(i => jobList.some(j => j.id === i.jobId));
                return `
        <section class="grid gap-4 grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
          ${[{ l: t('active_jobs'), v: jobList.length, i: '⌘' }, { l: t('candidates_count'), v: new Set(appList.map(a => a.candidateId)).size, i: '◌' }, { l: t('interviews_completed'), v: interviewList.length, i: '◉' }, { l: t('shortlisted_count'), v: appList.filter(a => ['SHORTLISTED', 'QUALIFIED'].includes(a.status)).length, i: '✓' }].map(s => `
            <div class="glass rounded-[28px] p-5 sm:p-6 stat-card hover:-translate-y-1 transition-transform">
              <div class="flex items-center justify-between text-xs sm:text-sm" style="color: var(--muted);"><span class="truncate pr-2">${s.l}</span> <span class="text-lg sm:text-xl shrink-0" style="color: var(--accent);">${s.i}</span></div>
              <div class="mt-2 sm:mt-3 text-2xl sm:text-4xl font-black">${s.v}</div>
            </div>`).join('')}
        </section>
        <section class="grid gap-6 xl:grid-cols-[1.25fr_.75fr] w-full">
          <div class="glass rounded-[28px] p-5 sm:p-6 w-full overflow-hidden">
            <h2 class="text-xl sm:text-2xl font-black mb-4 section-title">${t('hiring_funnel')}</h2>
            <div class="h-64 sm:h-80 w-full relative"><canvas id="funnelChart"></canvas></div>
          </div>
          <div class="glass rounded-[28px] p-5 sm:p-6 w-full overflow-hidden">
            <h2 class="text-xl sm:text-2xl font-black mb-4 section-title">${t('top_candidates')}</h2>
            <div class="space-y-3">
              ${appList.length ? [...appList].sort((a, b) => b.interviewScore - a.interviewScore).slice(0, 5).map(a => `<div class="glass-strong rounded-[24px] p-4 flex justify-between items-center hover:scale-[1.01] transition-transform text-sm sm:text-base"><div class="font-bold truncate pr-3">${users().find(u => u.id === a.candidateId)?.name}</div><div class="text-[var(--accent)] font-black shrink-0">${a.interviewScore || 0}%</div></div>`).join('') : `<div class="empty-state">${t('no_candidates')}</div>`}
            </div>
          </div>
        </section>
      `;
            }

            function recruiterJobs() {
                const mine = jobs();
                const search = state.searchQuery.toLowerCase();
                const filtered = search ? mine.filter(j => j.title.toLowerCase().includes(search) || j.department.toLowerCase().includes(search) || j.skillsRequired.toLowerCase().includes(search)) : mine;

                return `
        <section class="glass rounded-[28px] p-5 sm:p-6"><h2 class="text-xl sm:text-2xl font-black section-title mb-4">${t('create_job')}</h2>
          <form id="jobForm" class="grid gap-4 md:grid-cols-2">
            <input class="input" name="title" placeholder="${t('job_title')}" required> <input class="input" name="department" placeholder="${t('department')}" required>
            <input class="input" name="experienceLevel" placeholder="${t('experience_level')}" required> <input class="input" name="skillsRequired" placeholder="${t('skills_required')}" required>
            <input class="input" name="companyCulture" placeholder="${t('company_culture')}" required>
            <div class="flex gap-3 sm:gap-4 flex-col sm:flex-row">
                <input class="input" name="minPassingScore" type="number" value="70" placeholder="${t('min_score')}">
                <input class="input" name="interviewDuration" type="number" value="20" placeholder="${t('duration_min')}">
            </div>
            <select class="select" name="template"><option>STARTUP</option><option>GOOGLE</option><option>CUSTOM</option></select>
            <button class="btn btn-primary md:col-span-2 mt-2" type="submit" id="jobSubmitBtn"><span id="jobBtnText">${t('generate_ai_interview')}</span><span id="jobBtnLoader" class="loader hidden-i"></span></button>
          </form>
        </section>
        <section class="glass rounded-[28px] p-5 sm:p-6">
          <div class="flex items-center justify-between gap-4 flex-wrap mb-4">
            <h2 class="text-xl sm:text-2xl font-black section-title">${t('your_jobs')} (${filtered.length})</h2>
            <input type="text" id="jobSearch" class="input max-w-xs w-full sm:w-auto" placeholder="${t('search_jobs')}" value="${state.searchQuery}">
          </div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            ${filtered.map(j => `<div class="glass-strong rounded-[26px] p-5 relative group hover:scale-[1.01] transition-transform"><button class="absolute top-4 right-4 sm:opacity-0 group-hover:opacity-100 btn btn-secondary px-2 py-1 text-xs" data-delete-job="${j.id}">🗑</button><h3 class="text-lg sm:text-xl font-bold pr-6">${j.title}</h3><p class="text-xs sm:text-sm text-[var(--muted)]">${j.department}</p><p class="mt-2 text-xs" style="color:var(--muted)">${t('skills_label')} ${j.skillsRequired}</p></div>`).join('')}
          </div>
        </section>
      `;
            }

            function recruiterTraining() {
                const mineJobs = jobs();
                const mineTraining = trainings();
                return `
        <section class="glass rounded-[28px] p-5">
          <h2 class="text-xl sm:text-2xl font-black">${t('ai_training')}</h2>
          <p class="text-sm mt-1" style="color: var(--muted);">${t('training_desc')}</p>
          <form id="trainingForm" class="mt-5 grid gap-4 md:grid-cols-2">
            <select class="select" name="jobId" required>
              ${mineJobs.map(j => `<option value="${j.id}">${j.title}</option>`).join('')}
            </select>
            <input class="input" type="file" name="file" accept=".pdf,.doc,.docx,.txt" required>
            <select class="select" name="fileType">
              <option>PDF</option><option>DOCX</option><option>TXT</option><option>Notes</option>
            </select>
            <button class="btn btn-primary" type="submit" id="trainSubmitBtn">
              <span id="trainBtnText">${t('upload_train')}</span>
              <span id="trainBtnLoader" class="loader hidden-i"></span>
            </button>
          </form>
        </section>

        <section class="space-y-3">
          ${mineTraining.length ? mineTraining.map(tr => {
                    const job = jobs().find(j => j.id === tr.jobId);
                    return `
              <div class="glass-strong rounded-[26px] p-4 sm:p-5 hover:scale-[1.01] transition-transform duration-200">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 shrink-0 rounded-xl grid place-items-center" style="background: rgba(139,92,246,.12); font-size: 20px;">📄</div>
                    <div>
                      <div class="font-semibold text-sm sm:text-base">${job?.title || t('training_session')}</div>
                      <div class="text-xs sm:text-sm" style="color: var(--muted);">${tr.fileName} · ${tr.fileType}</div>
                    </div>
                  </div>
                  <div class="text-right ml-auto">
                    <div class="font-black" style="color: var(--accent);">${tr.progress}%</div>
                    <div class="text-xs" style="color: var(--muted);">${t(tr.status.toLowerCase()) || tr.status}</div>
                  </div>
                </div>
                <div class="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div class="h-full rounded-full ${tr.progress < 100 ? 'shimmer' : ''}" style="width:${tr.progress}%; background: linear-gradient(135deg, var(--accent), var(--accent2)); transition: width 1s ease;"></div>
                </div>
                <div class="mt-3 text-xs sm:text-sm" style="color: var(--muted);">${tr.summary || tr.status}</div>
                ${tr.progress === 100 ? `<button class="btn btn-secondary mt-3 text-xs" data-delete-training="${tr.id}">${t('remove')}</button>` : ''}
              </div>
            `;
                }).join('') : `<div class="glass rounded-[28px] p-5 empty-state"><div class="empty-state-icon">◫</div><div class="text-sm font-semibold">${t('no_training')}</div><div class="text-xs mt-1" style="color: var(--muted);">${t('training_empty_desc')}</div></div>`}
        </section>
      `;
            }

            function recruiterCandidates() {
                return `
        <section class="glass rounded-[28px] p-5">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 class="text-xl sm:text-2xl font-black">${t('candidate_management')}</h2>
              <p class="text-xs sm:text-sm mt-1" style="color: var(--muted);">${t('candidate_desc')}</p>
            </div>
            <div class="auth-chip text-xs">${t('auto_threshold')}</div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            ${['ALL', 'ABOVE THRESHOLD', 'REJECTED', 'PENDING', 'SHORTLISTED', 'QUALIFIED'].map(f => `<button class="btn btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm ${state.candidateFilter === f ? 'ring-2 ring-cyan-400/30' : ''}" data-filter="${f}">${t('filter_' + f.toLowerCase().replace(' ', '_')) || f}</button>`).join('')}
          </div>

          <div class="mt-4 table-wrap">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left" style="color: var(--muted);">
                  <th class="py-3 px-3 cursor-pointer hover:text-[var(--text)] transition-colors whitespace-nowrap" data-sort="name">${t('col_candidate')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_job')}</th>
                  <th class="py-3 px-3 cursor-pointer hover:text-[var(--text)] transition-colors whitespace-nowrap" data-sort="score">${t('col_score')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_confidence')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_stress')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_communication')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_technical')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_culture')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_status')}</th>
                </tr>
              </thead>
              <tbody id="candidateRows"></tbody>
            </table>
          </div>
        </section>
      `;
            }

            function recruiterAnalytics() {
                const appData = apps();
                const avgScore = avg(appData.map(a => a.interviewScore || 0));
                const shortlistRate = appData.length ? Math.round(appData.filter(a => ['SHORTLISTED', 'QUALIFIED'].includes(a.status)).length / appData.length * 100) : 0;
                return `
        <section class="grid gap-4 md:grid-cols-3">
          <div class="glass rounded-[28px] p-5 hover:-translate-y-1 transition-transform duration-300"><div class="text-sm" style="color: var(--muted);">${t('avg_score')}</div><div class="mt-2 sm:mt-3 text-3xl sm:text-4xl font-black">${avgScore}%</div></div>
          <div class="glass rounded-[28px] p-5 hover:-translate-y-1 transition-transform duration-300"><div class="text-sm" style="color: var(--muted);">${t('shortlist_rate')}</div><div class="mt-2 sm:mt-3 text-3xl sm:text-4xl font-black">${shortlistRate}%</div></div>
          <div class="glass rounded-[28px] p-5 hover:-translate-y-1 transition-transform duration-300"><div class="text-sm" style="color: var(--muted);">${t('total_candidates')}</div><div class="mt-2 sm:mt-3 text-3xl sm:text-4xl font-black">${appData.length}</div></div>
        </section>
        <section class="glass rounded-[28px] p-5 w-full overflow-hidden">
          <h2 class="text-xl sm:text-2xl font-black mb-4">${t('analytics')}</h2>
          <div class="mt-5 grid gap-4 lg:grid-cols-2">
            <div class="glass-strong rounded-[26px] p-4 h-64 sm:h-80 w-full relative"><canvas id="barChart"></canvas></div>
            <div class="glass-strong rounded-[26px] p-4 h-64 sm:h-80 w-full relative"><canvas id="pieChart"></canvas></div>
          </div>
        </section>
      `;
            }

            function recruiterSettings() {
                const u = currentUser();
                return `
        <section class="glass rounded-[28px] p-5">
          <h2 class="text-xl sm:text-2xl font-black">${t('settings')}</h2>
          <form id="settingsForm" class="mt-5 grid gap-4 md:grid-cols-2">
            <div><label class="text-sm font-semibold mb-2 block" style="color: var(--muted);">${t('full_name')}</label><input class="input" name="name" value="${u.name}" required></div>
            <div><label class="text-sm font-semibold mb-2 block" style="color: var(--muted);">${t('email')}</label><input class="input" name="email" value="${u.email}" disabled style="opacity: .6;"></div>
            <div><label class="text-sm font-semibold mb-2 block" style="color: var(--muted);">${t('company')}</label><input class="input" name="company" value="${u.companyName || ''}" ${u.role === 'CANDIDATE' ? 'disabled style="opacity: .6;"' : ''}></div>
            <div><label class="text-sm font-semibold mb-2 block" style="color: var(--muted);">${t('role')}</label><input class="input" value="${u.role}" disabled style="opacity: .6;"></div>
            <div class="md:col-span-2"><button type="submit" class="btn btn-primary mt-2" id="settingsBtn"><span id="settingsBtnText">${t('save_changes')}</span><span id="settingsBtnLoader" class="loader hidden-i"></span></button></div>
          </form>
          <div class="mt-8 border-t pt-6" style="border-color: var(--border);">
            <h3 class="text-lg font-bold mb-4" style="color: var(--bad);">${t('danger_zone')}</h3>
            <div class="glass-strong rounded-[24px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div><div class="font-semibold">${t('delete_account')}</div><div class="text-sm" style="color: var(--muted);">${t('delete_desc')}</div></div>
              <button class="btn btn-danger w-full sm:w-auto shrink-0" onclick="deleteAccount()">${t('delete_account')}</button>
            </div>
          </div>
        </section>
      `;
            }

            function candidateAvailable() {
                const list = jobs();
                const me = currentUser();
                const completedJobs = new Set(apps().filter(a => a.candidateId === me.id).map(a => a.jobId));
                return `<section class="glass rounded-[28px] p-5 sm:p-6"><h2 class="text-xl sm:text-2xl font-black section-title mb-4">${t('available_interviews')}</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${list.map(j => {
                    const isCompleted = completedJobs.has(j.id);
                    return `<div class="glass-strong rounded-[26px] p-5 ${isCompleted ? 'opacity-60' : 'hover:scale-[1.01] transition-transform'} flex flex-col h-full"><h3 class="text-lg sm:text-xl font-bold">${j.title}</h3><p class="text-sm mt-2 mb-4 text-[var(--muted)] flex-1">${j.department}</p><button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} w-full" data-start="${j.id}" ${isCompleted ? 'disabled' : ''}>${isCompleted ? '✓ ' + t('completed') : t('start_interview')}</button></div>`
                }).join('')}
        </div></section>`;
            }

            function candidateResults() {
                const me = currentUser();
                const res = apps().filter(a => a.candidateId === me.id).map(a => ({ ...a, job: jobs().find(j => j.id === a.jobId) }));
                const latest = res[0]?.report || null;
                return `<section class="grid gap-4 grid-cols-2 lg:grid-cols-4">
          ${[[t('eye_contact'), latest?.eyeContact ?? 0, '👁'], [t('col_confidence'), latest?.confidence ?? 0, '💪'], [t('col_stress'), latest?.stress ?? 0, '🧘'], [t('clarity'), latest?.clarity ?? 0, '✨']].map(([l, v, i]) => `
            <div class="glass rounded-[28px] p-4 sm:p-5 stat-card hover:-translate-y-1 transition-transform duration-300">
              <div class="flex items-center justify-between"><div class="text-xs sm:text-sm truncate pr-1" style="color: var(--muted);">${l}</div><span class="shrink-0" style="font-size: 18px;">${i}</span></div>
              <div class="mt-2 sm:mt-3 text-2xl sm:text-4xl font-black">${v}%</div>
            </div>`).join('')}
        </section>
        <section class="glass rounded-[28px] p-5">
          <h2 class="text-xl sm:text-2xl font-black">${t('ai_feedback')}</h2>
          <div class="mt-4 glass-strong rounded-[24px] p-4 sm:p-5"><p class="leading-7 text-sm sm:text-lg">${latest?.feedback || t('no_results_yet')}</p></div>
        </section>
        <section class="glass rounded-[28px] p-5"><h2 class="text-xl sm:text-2xl font-black">${t('past_results')}</h2>
          <div class="mt-4 space-y-3">
            ${res.length ? res.map(r => `<div class="glass-strong rounded-[24px] p-4 flex items-center justify-between text-sm sm:text-base"><div class="font-semibold truncate pr-3">${r.job?.title || 'Job'}</div><div class="font-black text-[var(--accent)] shrink-0">${r.interviewScore || 0}%</div></div>`).join('') : `<div class="empty-state">${t('no_results_yet')}</div>`}
          </div>
        </section>`;
            }

            function candidateReports() {
                const me = currentUser(); const res = apps().filter(a => a.candidateId === me.id);
                return `<section class="glass rounded-[28px] p-5"><h2 class="text-xl sm:text-2xl font-black">${t('reports')}</h2><div class="mt-4 space-y-3">
            ${res.length ? res.map(r => `<div class="glass-strong rounded-[24px] p-4 flex items-center justify-between"><div class="font-semibold text-sm sm:text-base truncate pr-3">${jobs().find(j => j.id === r.jobId)?.title || 'Job'}</div><button class="btn btn-secondary text-xs sm:text-sm" data-download="${r.id}">${t('download')}</button></div>`).join('') : `<div class="empty-state">${t('no_reports_yet')}</div>`}
          </div></section>`;
            }

            function candidateProfile() {
                const u = currentUser();
                return `<section class="glass rounded-[28px] p-5"><h2 class="text-xl sm:text-2xl font-black">${t('profile')}</h2><div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div class="glass-strong rounded-[24px] p-4"><div class="text-sm" style="color: var(--muted);">${t('full_name')}</div><div class="mt-1 font-semibold truncate">${u.name}</div></div>
            <div class="glass-strong rounded-[24px] p-4"><div class="text-sm" style="color: var(--muted);">${t('email')}</div><div class="mt-1 font-semibold truncate">${u.email}</div></div>
            <div class="glass-strong rounded-[24px] p-4 sm:col-span-2"><div class="text-sm" style="color: var(--muted);">${t('role')}</div><div class="mt-1 font-semibold">${u.role}</div></div>
          </div></section>`;
            }

            // ===== YENİLƏNMİŞ İMMERSİV MÜSAHİBƏ GÖRÜNÜŞÜ =====
            function interviewView() {
                const d = state.interviewDraft;
                if (!d) return `<div class="glass rounded-[28px] p-5 empty-state"><div class="empty-state-icon">⚠</div><div class="text-sm font-semibold">${t('no_interview_loaded')}</div></div>`;

                return `
        <section class="immersive-interview glass rounded-[34px] overflow-hidden relative flex flex-col w-full h-[100dvh] min-h-screen border-none">
            <!-- Fullscreen Camera Background -->
            <video id="camVideo" autoplay playsinline muted class="absolute inset-0 w-full h-full object-cover z-0"></video>
            
            <div id="camPlaceholder" class="absolute inset-0 z-0 bg-black/90 flex items-center justify-center flex-col text-white">
                 <div class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl" style="background: rgba(99,102,241,.16);">📷</div>
                 <div class="text-lg font-bold">${t('cam_required')}</div>
                 <div class="text-sm opacity-70 mt-2">${t('press_start')}</div>
            </div>

            <!-- Top Gradient Overlay (for Header & Stats) -->
            <div class="absolute top-0 left-0 right-0 p-5 z-10 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start pointer-events-none">
                <div class="flex items-center gap-3">
                    <div class="auth-chip border-white/20 bg-black/40 text-white shadow-xl backdrop-blur-md pointer-events-auto">
                        <span class="dot pulse"></span> ${t('live')}
                    </div>
                </div>
                <div class="flex items-start gap-4 pointer-events-auto">
                    <!-- Live Stats over Camera -->
                    <div class="flex gap-3">
                        <div class="glass-strong bg-black/40 border-white/10 rounded-2xl p-2 px-3 text-center text-white backdrop-blur-md min-w-[70px]">
                            <div class="text-[9px] uppercase tracking-wider opacity-70">${t('eye_contact')}</div>
                            <div id="liveEye" class="font-black mt-0.5">82%</div>
                        </div>
                        <div class="glass-strong bg-black/40 border-white/10 rounded-2xl p-2 px-3 text-center text-white backdrop-blur-md min-w-[70px]">
                            <div class="text-[9px] uppercase tracking-wider opacity-70 mb-1">${t('speech_level')}</div>
                            <div class="h-1.5 w-12 mx-auto rounded-full bg-white/20 overflow-hidden">
                                <div id="micLevelBar" class="h-full rounded-full" style="width: 15%; background: linear-gradient(135deg, var(--accent), var(--accent2)); transition: width .1s ease;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="glass-strong bg-black/40 border-white/10 rounded-2xl p-2 px-4 text-center text-white backdrop-blur-md">
                        <div class="text-[10px] uppercase tracking-wider opacity-70">${t('time_left')}</div>
                        <div id="timerLabel" class="font-mono text-xl font-bold mt-0.5">00:00</div>
                    </div>
                    
                    <button class="btn btn-secondary border-white/20 bg-black/40 text-white hover:bg-white/10 backdrop-blur-md" onclick="saveInterviewDraft()">💾 ${t('save_draft')}</button>
                </div>
            </div>

            <!-- Bottom Immersive Question Panel -->
            <div class="mt-auto relative z-10 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-32 pb-6 px-6 sm:px-10">
                <div class="max-w-4xl mx-auto w-full flex flex-col gap-4">
                    
                    <!-- Question Display -->
                    <div class="mb-2 text-white">
                        <span class="text-[var(--accent)] font-bold text-xs tracking-[0.2em] uppercase bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
                            ${t('question')} <span id="qIdxLabel">1</span> / ${d.questions.length}
                        </span>
                        <h3 id="currentQText" class="text-2xl sm:text-3xl lg:text-4xl font-black mt-4 leading-tight text-shadow-lg"></h3>
                    </div>
                    
                    <!-- Active Textarea -->
                    <div class="relative mt-2 group">
                        <textarea id="currentAnswer" class="textarea w-full bg-black/40 border-white/20 text-white placeholder-white/40 focus:border-[var(--accent)] focus:bg-black/60 transition-all duration-300 rounded-[20px] p-5 text-base sm:text-lg resize-none backdrop-blur-md shadow-2xl" placeholder="${t('write_answer_here')}" rows="3"></textarea>
                        <div class="absolute bottom-4 right-5 text-xs opacity-50 text-white pointer-events-none transition-opacity group-focus-within:opacity-100">
                            <span id="charCount">0</span> ${t('chars')}
                        </div>
                    </div>

                    <!-- Navigation Controls -->
                    <div class="flex items-center justify-between mt-4 gap-4">
                        <button id="prevQBtn" class="btn btn-secondary border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed px-4 sm:px-6">← <span class="hidden sm:inline ml-2">${t('prev_question')}</span></button>
                        
                        <!-- Dots indicator -->
                        <div class="flex gap-2.5 items-center" id="qDots"></div>
                        
                        <button id="nextQBtn" class="btn btn-primary shadow-[0_0_25px_rgba(99,102,241,0.3)] px-4 sm:px-6"><span class="hidden sm:inline mr-2">${t('next_question')}</span> →</button>
                        <button id="submitInterviewBtn" class="btn btn-primary shadow-[0_0_25px_rgba(168,85,247,0.30)] px-4 sm:px-6 hidden-i">
                            <span id="submitBtnText">${t('finish_interview')}</span>
                            <span id="submitBtnLoader" class="loader hidden-i"></span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
      `;
            }

            function premiumInterviewView() {
                const d = state.interviewDraft;
                if (!d) return `<div class="glass rounded-[28px] p-5 empty-state"><div class="empty-state-icon">⚠</div><div class="text-sm font-semibold">${t('no_interview_loaded')}</div></div>`;

                return `
        <section class="interview-command-center fixed inset-0 z-[80] h-[100dvh] w-screen overflow-hidden bg-slate-950 text-slate-100">
          <div class="interview-ambient" aria-hidden="true"></div>

          <header class="interview-topbar">
            <div class="flex min-w-0 items-center gap-3">
              <div class="live-orb"><span></span></div>
              <div class="min-w-0">
                <p class="telemetry-kicker">LIVE AI TELEMETRY</p>
                <p class="truncate text-sm font-semibold text-white">${d.job.title}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="telemetry-chip hidden sm:flex">
                <span class="text-slate-400">${t('time_left')}</span>
                <span id="timerLabel" class="font-mono font-bold" style="color: var(--accent);">00:00</span>
              </div>
              <button class="telemetry-action" onclick="saveInterviewDraft()">⌘ <span class="hidden sm:inline">${t('save_draft')}</span></button>
              <button class="telemetry-action" onclick="exitInterview()" aria-label="${t('cancel')}">× <span class="hidden sm:inline">${t('cancel')}</span></button>
            </div>
          </header>

          <div class="interview-grid">
            <aside class="telemetry-rail telemetry-scroll" aria-label="Real time interview telemetry">
              <div class="telemetry-rail-head">
                <div>
                  <p class="telemetry-kicker">AI MÜSAHİBƏÇİ</p>
                  <h2>${d.job.title}</h2>
                </div>
                <span id="aiProctorPill" class="ai-proctor-pill ok"><i></i><span id="proctorStatus">AI Proctor: Aktiv</span></span>
              </div>

              <article class="telemetry-card audio-capture-card">
                <div class="telemetry-card-title">
                  <div>
                    <p>CANLI SƏS</p>
                    <span>Danışdıqca mətnə çevrilir</span>
                  </div>
                  <button id="speechToggleBtn" class="speech-toggle" type="button"><span id="speechToggleIcon">●</span><span id="speechToggleLabel">Danış</span></button>
                </div>
                <div id="speechSpectrum" class="speech-spectrum" aria-label="Live speech spectrum">
                  <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                </div>
                <div class="mic-meter"><i id="micLevelBar"></i></div>
                <div id="sttStatus" class="stt-status">Mətnə çevirmə hazır</div>
              </article>

              <div class="side-question-workspace">
                <div class="question-glass">
                  <div class="question-meta">
                    <span>${t('question')} <b id="qIdxLabel">1</b> / ${d.questions.length}</span>
                    <span id="answerReadiness">STAR hazırlığı 0%</span>
                  </div>
                  <h1 id="currentQText"></h1>
                </div>

                <div id="answerShell" class="answer-shell" style="--answer-accent:#8b5cf6;--answer-progress:0%;">
                  <textarea id="currentAnswer" class="star-answer" placeholder="${t('write_answer_here')}" rows="5"></textarea>
                  <div class="answer-status"><span>CAVAB REDAKTORU</span><span><b id="charCount">0</b> ${t('chars')}</span></div>
                </div>

                <div class="answer-send-row">
                  <button id="submitAnswerBtn" class="speech-submit" type="button">Cavabı Göndər</button>
                  <span id="answerDeliveryStatus"></span>
                </div>

                <div class="question-controls">
                  <button id="prevQBtn" class="stage-button secondary">← <span>${t('prev_question')}</span></button>
                  <div id="qDots" class="question-dots" aria-label="Question progress"></div>
                  <button id="nextQBtn" class="stage-button primary"><span>${t('next_question')}</span> →</button>
                  <button id="submitInterviewBtn" class="stage-button primary hidden-i">
                    <span id="submitBtnText">${t('finish_interview')}</span><span id="submitBtnLoader" class="loader hidden-i"></span>
                  </button>
                </div>
              </div>
            </aside>

            <main id="candidateStage" class="candidate-stage">
              <video id="camVideo" autoplay playsinline muted class="candidate-camera"></video>
              <div id="camPlaceholder" class="camera-placeholder">
                <div class="camera-placeholder-icon">◉</div>
                <h3>${t('cam_required')}</h3>
                <p>${t('press_start')}</p>
              </div>
              <div id="proctorToast" class="camera-proctor-toast hidden-i" role="status"></div>
            </main>
          </div>
        </section>`;
            }

            function responseTelemetry() {
                const d = state.interviewDraft;
                const answer = d?.answers?.[state.currentQIdx] || '';
                const text = answer.toLowerCase();
                const markers = ['situation', 'task', 'action', 'result', 'problem', 'goal', 'impact', 'outcome'];
                const markerCount = markers.filter(marker => text.includes(marker)).length;
                const lengthScore = clamp(Math.round((answer.length / 320) * 70), 0, 70);
                return {
                    answer,
                    progress: clamp(Math.round((answer.length / 320) * 100), 0, 100),
                    star: clamp(lengthScore + markerCount * 8, 0, 100),
                    wpm: mic.level > 12 ? clamp(Math.round(74 + mic.level * .86), 74, 176) : 0
                };
            }

            function renderResponseTelemetry() {
                const data = responseTelemetry();
                const hue = Math.round(268 - data.progress * 1.16);
                const accent = `hsl(${hue} 82% 62%)`;
                const shell = document.getElementById('answerShell');
                const textarea = document.getElementById('currentAnswer');
                const count = document.getElementById('charCount');
                const star = document.getElementById('starMetric');
                const readiness = document.getElementById('answerReadiness');
                const wpm = document.getElementById('wpmMetric');
                const pace = document.getElementById('paceLabel');

                if (shell) { shell.style.setProperty('--answer-accent', accent); shell.style.setProperty('--answer-progress', `${data.progress}%`); }
                if (textarea) textarea.style.boxShadow = `0 0 0 1px color-mix(in srgb, ${accent} 56%, transparent), 0 18px 42px color-mix(in srgb, ${accent} 18%, transparent)`;
                if (count) count.textContent = data.answer.length;
                if (star) star.textContent = `${data.star}%`;
                if (readiness) readiness.textContent = `STAR readiness ${data.star}%`;
                if (wpm) wpm.textContent = data.wpm ? `${data.wpm} WPM` : '—';
                if (pace) pace.textContent = data.wpm ? (data.wpm >= 95 && data.wpm <= 155 ? 'Balanced pace' : data.wpm > 155 ? 'Fast delivery' : 'Measured pace') : 'Awaiting voice';
            }

            function renderLiveTelemetry(signal = {}) {
                const m = window.interviewMetrics || {};
                const focus = clamp(Number(signal.focus ?? m.latestFocus ?? 0), 0, 100);
                const stress = clamp(Number(signal.stress ?? m.latestStress ?? 0), 0, 100);
                const happy = clamp(Number(signal.happy ?? m.latestHappy ?? 0), 0, 100);
                const setWidth = (id, value) => { const el = document.getElementById(id); if (el) el.style.width = `${value}%`; };
                const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };

                setWidth('eyeTrackingLine', focus);
                setWidth('valenceBar', happy);
                setWidth('stressBar', stress);
                setText('eyeMapValue', `${focus}%`);
                setText('valenceValue', `${happy}%`);
                setText('stressValue', `${stress}%`);
                const wave = document.getElementById('emotionWave');
                const spectrum = document.getElementById('speechSpectrum');
                if (wave) wave.style.setProperty('--wave-energy', String(Math.max(happy, stress) / 100));
                if (spectrum) spectrum.style.setProperty('--signal-strength', String((mic.level || 0) / 100));
                const hint = document.getElementById('telemetryHint');
                if (hint) hint.textContent = focus < 35 ? 'Camera focus is searching for a stable face signal.' : stress > 60 ? 'Stress signal elevated — take a brief breath before continuing.' : happy > 45 ? 'Positive valence is stable. Keep your delivery measured and clear.' : 'Signals are stable. Add a concrete action and result to strengthen STAR fit.';
                renderResponseTelemetry();
            }

            function updateQuestionUI() {

                const d = state.interviewDraft;

                const idx = state.currentQIdx;

                const ans = d.answers[idx] || "";

                document.getElementById("qIdxLabel").textContent = idx + 1;

                document.getElementById("currentQText").textContent = d.questions[idx];

                const ta = document.getElementById("currentAnswer");

                if (ta) {

                    // Mikrofon işləyərkən textarea-nın məzmununu dəyişmə
                    if (!speech.shouldListen) {
                        ta.value = ans;
                    }

                    // Yazı artdıqca avtomatik aşağı sürüşdür
                    ta.scrollTop = ta.scrollHeight;

                }

                renderResponseTelemetry();

                // Buttons
                const prev = document.getElementById("prevQBtn");
                const next = document.getElementById("nextQBtn");
                const submit = document.getElementById("submitInterviewBtn");

                prev.disabled = idx === 0;

                if (idx === d.questions.length - 1) {

                    next.classList.add("hidden-i");
                    submit.classList.remove("hidden-i");

                } else {

                    next.classList.remove("hidden-i");
                    submit.classList.add("hidden-i");

                }

                // Question dots
                document.getElementById("qDots").innerHTML = d.questions.map((_, i) => {

                    let dotClass = "pending";

                    if (i === idx) {

                        dotClass = "active";

                    } else if ((d.answers[i] || "").trim().length > 20) {

                        dotClass = "answered";

                    }

                    return `<i class="question-dot ${dotClass}"></i>`;

                }).join("");

            }

            function setSpeechUI({ listening = false, message = 'Mətnə çevirmə hazır' } = {}) {
                const status = document.getElementById('sttStatus');
                const button = document.getElementById('speechToggleBtn');
                const label = document.getElementById('speechToggleLabel');
                const icon = document.getElementById('speechToggleIcon');
                if (status) { status.textContent = message; status.classList.toggle('listening', listening); }
                if (button) button.classList.toggle('listening', listening);
                if (label) label.textContent = listening ? 'Dayandır' : 'Danış';
                if (icon) icon.textContent = listening ? '■' : '●';
            }

            function syncSpeechTranscript(questionIndex = speech.questionIndex) {

                const d = state.interviewDraft;

                const ta = document.getElementById("currentAnswer");

                if (!d || questionIndex !== state.currentQIdx) return;

                const fullText = (
                    speech.baseText +
                    speech.finalText +
                    speech.interimText
                )
                    .replace(/\s+/g, " ")
                    .trim();

                d.answers[questionIndex] = fullText;

                if (ta) {
                    ta.value = fullText;
                    ta.scrollTop = ta.scrollHeight;
                }

                renderResponseTelemetry();
            }

            function scheduleSpeechRestart(delay = 250) {
                clearTimeout(speech.restartTimer);
                if (!speech.shouldListen || !state.interviewDraft || state.activeNav !== 'interview' || state.interviewSubmitting) return;
                speech.restartTimer = setTimeout(() => {
                    speech.restartTimer = null;
                    if (speech.shouldListen) startSpeechToText();
                }, delay);
            }

            function stopSpeechToText({ keepMessage = false, discardInstance = false } = {}) {
                speech.shouldListen = false;
                speech.isStarting = false;
                clearTimeout(speech.silenceTimer); speech.silenceTimer = null;
                clearTimeout(speech.restartTimer); speech.restartTimer = null;
                const recognition = speech.recognition;
                if (recognition) {
                    recognition.onstart = null;
                    recognition.onresult = null;
                    recognition.onerror = null;
                    recognition.onend = null;
                    try { recognition.abort(); } catch { try { recognition.stop(); } catch { } }
                }
                if (discardInstance) speech.recognition = null;
                speech.finalText = '';
                speech.interimText = '';
                speech.baseText = '';
                speech.questionIndex = -1;
                if (!keepMessage) setSpeechUI();
            }

            function startSpeechToText() {
                const d = state.interviewDraft;
                if (!d || state.activeNav !== 'interview' || state.interviewSubmitting) return;
                const recognition = ensureSpeechInstance();
                if (!recognition) {
                    setSpeechUI({ message: 'Bu brauzerdə səsdən-mətnə çevirmə dəstəklənmir' });
                    return;
                }
                if (speech.isStarting) return;
                speech.shouldListen = true;
                speech.questionIndex = state.currentQIdx;
                speech.baseText = String(d.answers[state.currentQIdx] || '').trim();
                speech.finalText = '';
                speech.interimText = '';
                speech.isStarting = true;
                try {
                    recognition.lang = speechLanguageFor(currentLang);
                    recognition.start();
                } catch {
                    speech.isStarting = false;
                    scheduleSpeechRestart(500);
                }
            }
            // ===== RENDER SYSTEM =====
            window.render = function () {
                const u = currentUser();
                if (!u && state.view !== 'auth') state.view = 'landing';
                if (u) state.view = 'app';
                if (state.view === 'landing') renderLanding();
                else if (state.view === 'auth') { renderLanding(); renderAuthModal(); bindLanding(); }
                else renderApp();

                applyTranslations();
            }

            function renderLanding() {
                document.getElementById('app').innerHTML = document.getElementById('tpl-landing').innerHTML;
                document.body.classList.add('grain');
                document.getElementById('year').textContent = new Date().getFullYear();

                document.getElementById('featureGrid').innerHTML = FEATURE_CARDS[currentLang].map((f, idx) => `
        <div class="premium-card rounded-[30px] p-6 stat-card hover:-translate-y-1 transition-all duration-300 fade-up" style="animation-delay:${idx * 40}ms">
          <div class="h-14 w-14 rounded-2xl grid place-items-center text-2xl mb-4 soft-shadow" style="background: linear-gradient(135deg, rgba(79,70,229,.14), rgba(139,92,246,.12));">${f.icon}</div>
          <h3 class="text-xl font-bold font-space">${f.title}</h3>
          <p class="mt-2 text-sm leading-6" style="color: var(--muted);">${f.text}</p>
        </div>
      `).join('');

                document.getElementById('pricingGrid').innerHTML = PRICING[currentLang].map((p, i) => `
        <div class="premium-card rounded-[30px] p-6 ${i === 1 ? 'ring-2 ring-cyan-400/20 relative' : ''} hover:-translate-y-1 transition-all duration-300 cursor-pointer fade-up" style="animation-delay:${i * 60}ms" onclick="selectPlan('${p.name}')">
          ${i === 1 ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2"><span class="pill" style="background: linear-gradient(135deg, rgba(99,102,241,.18), rgba(168,85,247,.14)); color: var(--accent); font-weight: 700; font-size: 10px;">Most Popular</span></div>' : ''}
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-extrabold">${p.name}</h3>
          </div>
          <div class="mt-3 text-3xl sm:text-4xl font-black">${p.price}</div>
          <p class="mt-3 text-sm leading-6" style="color: var(--muted);">${p.desc}</p>
          <ul class="mt-4 space-y-2">
            ${p.features.map(f => `<li class="flex items-start gap-2 text-sm" style="color: var(--muted);"><span style="color: var(--good); margin-top: 1px;">✓</span> <span>${f}</span></li>`).join('')}
          </ul>
          <button class="btn ${i === 1 ? 'btn-primary' : 'btn-secondary'} w-full mt-5" data-open-auth="signup" data-key="get_started_free">${t('get_started_free')}</button>
        </div>
      `).join('');

                document.getElementById('testimonialsGrid').innerHTML = TESTIMONIALS[currentLang].map((t, idx) => `
        <div class="premium-card rounded-[30px] p-6 hover:-translate-y-1 transition-transform duration-300 fade-up" style="animation-delay:${idx * 50}ms">
          <div class="text-2xl mb-3" style="color: var(--accent);">"</div>
          <p class="leading-7 text-sm">${t.quote}</p>
          <div class="mt-4 flex items-center gap-3">
            <div class="h-10 w-10 shrink-0 rounded-full grid place-items-center text-sm font-bold" style="background: linear-gradient(135deg, rgba(99,102,241,.18), rgba(168,85,247,.16));">${t.name.split(' ').map(n => n[0]).join('')}</div>
            <div>
              <div class="text-sm font-semibold">${t.name}</div>
              <div class="text-xs" style="color: var(--muted);">${t.role}, ${t.company}</div>
            </div>
          </div>
        </div>
      `).join('');

                bindLanding();
            }

            window.selectPlan = function (planName) {
                toast(t('msg_plan_selected').replace('{plan}', planName), 'info');
            }

            function bindLanding() {
                document.querySelectorAll('[data-open-auth]').forEach(btn => btn.addEventListener('click', () => { state.authMode = btn.getAttribute('data-open-auth'); state.view = 'auth'; render(); }));
                document.getElementById('mobileOpenBtn')?.addEventListener('click', () => document.getElementById('mobileMenu').classList.toggle('hidden'));

                document.getElementById('demoForm')?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const btnText = document.getElementById('demoBtnText');
                    const btnLoader = document.getElementById('demoBtnLoader');
                    btnText.classList.add('hidden-i');
                    btnLoader.classList.remove('hidden-i');

                    setTimeout(() => {
                        btnText.classList.remove('hidden-i');
                        btnLoader.classList.add('hidden-i');
                        closeDemoModal();
                        toast(t('msg_demo_success'), 'success');
                    }, 700);
                });
            }

            function renderAuthModal() {
                const wrap = document.createElement('div'); wrap.id = 'authOverlay'; wrap.innerHTML = document.getElementById('tpl-auth').innerHTML; document.body.appendChild(wrap);
                const overlay = wrap.querySelector('.auth-shell'); if (overlay) overlay.classList.add('fade-up');
                const titles = [document.getElementById('authTitle'), document.getElementById('authFormTitle')].filter(Boolean);
                const tabLogin = document.getElementById('tabLogin'); const tabSignup = document.getElementById('tabSignup');
                const name = document.getElementById('authName'); const role = document.getElementById('authRole'); const company = document.getElementById('authCompany');
                const nameField = document.getElementById('authNameField'); const roleField = document.getElementById('authRoleField'); const companyField = document.getElementById('authCompanyField');
                function syncMode() {
                    const signup = state.authMode === 'signup';
                    titles.forEach(title => title.textContent = signup ? t('signup') : t('login'));
                    tabLogin.className = `auth-mode-button ${signup ? '' : 'is-active'}`; tabSignup.className = `auth-mode-button ${signup ? 'is-active' : ''}`;
                    nameField.classList.toggle('hidden-i', !signup); roleField.classList.toggle('hidden-i', !signup); companyField.classList.toggle('hidden-i', !signup || role.value !== 'RECRUITER');
                    document.getElementById('authSubmit').querySelector('span:first-child').textContent = signup ? t('btn_signup') : t('btn_login');
                }
                tabLogin.onclick = () => { state.authMode = 'login'; syncMode(); }; tabSignup.onclick = () => { state.authMode = 'signup'; syncMode(); };
                const password = document.getElementById('authPassword');
                password?.addEventListener('input', () => { const meter = document.getElementById('passwordStrength'); if (meter) meter.style.width = Math.min(100, password.value.length * 12) + '%'; });
                role.onchange = syncMode; document.getElementById('closeAuthBtn').onclick = () => { wrap.remove(); state.view = 'landing'; render(); };
                document.getElementById('authEmail')?.addEventListener('input', () => { const el = document.getElementById('authLiveValidation'); if (el) el.textContent = document.getElementById('authEmail').value.includes('@') ? 'Email looks good' : 'Enter a valid email'; });

                document.getElementById('authForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('authEmail').value.trim(); const pass = document.getElementById('authPassword').value;
                    const err = document.getElementById('authError'); err.classList.add('hidden-i');
                    const btnText = document.getElementById('authBtnText'); const btnLoader = document.getElementById('authBtnLoader');
                    btnText.classList.add('hidden-i'); btnLoader.classList.remove('hidden-i');

                    try {
                        let user;
                        if (state.authMode === 'login') {
                            user = await login({ email, password: pass });
                        } else {
                            const fullName = name.value.trim();
                            const selectedRole = role.value;
                            if (!fullName || pass.length < 6) throw new Error(t('msg_err_pass_len'));
                            await register({ fullName, email, password: pass, confirmPassword: pass, role: selectedRole });
                            user = await login({ email, password: pass });
                        }
                        await hydrateRuntimeStore();
                        state.view = 'app'; state.activeNav = user.role === 'RECRUITER' ? 'dashboard' : 'available';
                        wrap.remove(); render();
                        toast(t('msg_welcome').replace('{name}', user.name), 'success');
                    } catch (error) {
                        btnText.classList.remove('hidden-i'); btnLoader.classList.add('hidden-i');
                        err.textContent = error.response?.data?.message || error.message || t('msg_err_login'); err.classList.remove('hidden-i');
                    }
                };
                syncMode();
                applyTranslations();
            }

            window.renderApp = function () {
                document.getElementById('app').innerHTML = document.getElementById('tpl-app').innerHTML;
                document.body.classList.add('grain');
                const u = currentUser(); if (!u) return;
                document.getElementById('userMeta').textContent = `${u.name}`;
                document.getElementById('workspaceName').textContent = u.role === 'RECRUITER' ? t('recruiter_hub') : t('candidate_portal');
                document.getElementById('workspaceDesc').textContent = u.role === 'RECRUITER' ? t('hub_desc') : t('portal_desc');
                document.getElementById('themeToggle').onclick = toggleTheme;

                // Real çıxış funksiyası User profilinə (və ya helper buttona) bağlanır
                document.getElementById('logoutBtnHelper').onclick = () => showConfirm(t('title_logout'), t('msg_logout'), async () => { await logout(); stopMedia(); state.view = 'landing'; render(); }, false);

                // Sidebar Mobile Toggle
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('sidebarOverlay');
                const toggleSidebar = () => {
                    sidebar.classList.toggle('-translate-x-full');
                    overlay.classList.toggle('hidden');
                };
                document.getElementById('sidebarToggle').onclick = toggleSidebar;
                document.getElementById('sidebarCloseBtn').onclick = toggleSidebar;
                overlay.onclick = toggleSidebar;

                renderNav(u.role); renderContent(u.role);
                applyTranslations();
            }

            function renderNav(role) {
                document.getElementById('nav').innerHTML = NAV[role].map(item => `
        <button class="nav-link ${state.activeNav === item.key ? 'active' : ''}" data-nav="${item.key}">
          <span class="mr-3 inline-flex w-5 text-center">${ICONS[item.key] || '•'}</span> ${t('nav_' + item.key)}
        </button>`).join('');
                document.querySelectorAll('[data-nav]').forEach(btn => btn.onclick = () => {
                    state.activeNav = btn.getAttribute('data-nav');
                    renderContent(role);
                    renderNav(role);

                    // Close sidebar on mobile
                    const sidebar = document.getElementById('sidebar');
                    const overlay = document.getElementById('sidebarOverlay');
                    if (window.innerWidth < 1024 && !sidebar.classList.contains('-translate-x-full')) {
                        sidebar.classList.add('-translate-x-full');
                        overlay.classList.add('hidden');
                    }
                });
            }

            function renderContent(role) {
                const c = document.getElementById('content'); c.className = 'space-y-6 fade-in w-full max-w-full overflow-hidden';
                if (role === 'RECRUITER') {
                    if (state.activeNav === 'dashboard') c.innerHTML = recruiterDashboard();
                    else if (state.activeNav === 'jobs') c.innerHTML = recruiterJobs();
                    else if (state.activeNav === 'training') c.innerHTML = recruiterTraining();
                    else if (state.activeNav === 'candidates') c.innerHTML = recruiterCandidates();
                    else if (state.activeNav === 'analytics') c.innerHTML = recruiterAnalytics();
                    else if (state.activeNav === 'settings') c.innerHTML = recruiterSettings();
                    bindRecruiter();
                } else {
                    if (state.activeNav === 'available') c.innerHTML = candidateAvailable();
                    else if (state.activeNav === 'results') c.innerHTML = candidateResults();
                    else if (state.activeNav === 'reports') c.innerHTML = candidateReports();
                    else if (state.activeNav === 'profile') c.innerHTML = candidateProfile();
                    else if (state.activeNav === 'interview') c.innerHTML = premiumInterviewView();
                    bindCandidate();
                }
                requestAnimationFrame(renderCharts);
            }

            function recruiterDashboard() {
                const jobList = jobs();
                const appList = apps().filter(a => jobList.some(j => j.id === a.jobId));
                const interviewList = interviews().filter(i => jobList.some(j => j.id === i.jobId));
                return `
        <section class="grid gap-4 grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
          ${[{ l: t('active_jobs'), v: jobList.length, i: '⌘' }, { l: t('candidates_count'), v: new Set(appList.map(a => a.candidateId)).size, i: '◌' }, { l: t('interviews_completed'), v: interviewList.length, i: '◉' }, { l: t('shortlisted_count'), v: appList.filter(a => ['SHORTLISTED', 'QUALIFIED'].includes(a.status)).length, i: '✓' }].map(s => `
            <div class="glass rounded-[28px] p-5 sm:p-6 stat-card hover:-translate-y-1 transition-transform">
              <div class="flex items-center justify-between text-xs sm:text-sm" style="color: var(--muted);"><span class="truncate pr-2">${s.l}</span> <span class="text-lg sm:text-xl shrink-0" style="color: var(--accent);">${s.i}</span></div>
              <div class="mt-2 sm:mt-3 text-2xl sm:text-4xl font-black">${s.v}</div>
            </div>`).join('')}
        </section>
        <section class="grid gap-6 xl:grid-cols-[1.25fr_.75fr] w-full">
          <div class="glass rounded-[28px] p-5 sm:p-6 w-full overflow-hidden">
            <h2 class="text-xl sm:text-2xl font-black mb-4 section-title">${t('hiring_funnel')}</h2>
            <div class="h-64 sm:h-80 w-full relative"><canvas id="funnelChart"></canvas></div>
          </div>
          <div class="glass rounded-[28px] p-5 sm:p-6 w-full overflow-hidden">
            <h2 class="text-xl sm:text-2xl font-black mb-4 section-title">${t('top_candidates')}</h2>
            <div class="space-y-3">
              ${appList.length ? [...appList].sort((a, b) => b.interviewScore - a.interviewScore).slice(0, 5).map(a => `<div class="glass-strong rounded-[24px] p-4 flex justify-between items-center hover:scale-[1.01] transition-transform text-sm sm:text-base"><div class="font-bold truncate pr-3">${users().find(u => u.id === a.candidateId)?.name}</div><div class="text-[var(--accent)] font-black shrink-0">${a.interviewScore || 0}%</div></div>`).join('') : `<div class="empty-state">${t('no_candidates')}</div>`}
            </div>
          </div>
        </section>
      `;
            }

            function recruiterJobs() {
                const mine = jobs();
                const search = state.searchQuery.toLowerCase();
                const filtered = search ? mine.filter(j => j.title.toLowerCase().includes(search) || j.department.toLowerCase().includes(search) || j.skillsRequired.toLowerCase().includes(search)) : mine;

                return `
        <section class="glass rounded-[28px] p-5 sm:p-6"><h2 class="text-xl sm:text-2xl font-black section-title mb-4">${t('create_job')}</h2>
          <form id="jobForm" class="grid gap-4 md:grid-cols-2">
            <input class="input" name="title" placeholder="${t('job_title')}" required> <input class="input" name="department" placeholder="${t('department')}" required>
            <input class="input" name="experienceLevel" placeholder="${t('experience_level')}" required> <input class="input" name="skillsRequired" placeholder="${t('skills_required')}" required>
            <input class="input" name="companyCulture" placeholder="${t('company_culture')}" required>
            <div class="flex gap-3 sm:gap-4 flex-col sm:flex-row">
                <input class="input" name="minPassingScore" type="number" value="70" placeholder="${t('min_score')}">
                <input class="input" name="interviewDuration" type="number" value="20" placeholder="${t('duration_min')}">
            </div>
            <select class="select" name="template"><option>STARTUP</option><option>GOOGLE</option><option>CUSTOM</option></select>
            <button class="btn btn-primary md:col-span-2 mt-2" type="submit" id="jobSubmitBtn"><span id="jobBtnText">${t('generate_ai_interview')}</span><span id="jobBtnLoader" class="loader hidden-i"></span></button>
          </form>
        </section>
        <section class="glass rounded-[28px] p-5 sm:p-6">
          <div class="flex items-center justify-between gap-4 flex-wrap mb-4">
            <h2 class="text-xl sm:text-2xl font-black section-title">${t('your_jobs')} (${filtered.length})</h2>
            <input type="text" id="jobSearch" class="input max-w-xs w-full sm:w-auto" placeholder="${t('search_jobs')}" value="${state.searchQuery}">
          </div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            ${filtered.map(j => `<div class="glass-strong rounded-[26px] p-5 relative group hover:scale-[1.01] transition-transform"><button class="absolute top-4 right-4 sm:opacity-0 group-hover:opacity-100 btn btn-secondary px-2 py-1 text-xs" data-delete-job="${j.id}">🗑</button><h3 class="text-lg sm:text-xl font-bold pr-6">${j.title}</h3><p class="text-xs sm:text-sm text-[var(--muted)]">${j.department}</p><p class="mt-2 text-xs" style="color:var(--muted)">${t('skills_label')} ${j.skillsRequired}</p></div>`).join('')}
          </div>
        </section>
      `;
            }

            function recruiterTraining() {
                const mineJobs = jobs();
                const mineTraining = trainings();
                return `
        <section class="glass rounded-[28px] p-5">
          <h2 class="text-xl sm:text-2xl font-black">${t('ai_training')}</h2>
          <p class="text-sm mt-1" style="color: var(--muted);">${t('training_desc')}</p>
          <form id="trainingForm" class="mt-5 grid gap-4 md:grid-cols-2">
            <select class="select" name="jobId" required>
              ${mineJobs.map(j => `<option value="${j.id}">${j.title}</option>`).join('')}
            </select>
            <input class="input" type="file" name="file" accept=".pdf,.doc,.docx,.txt" required>
            <select class="select" name="fileType">
              <option>PDF</option><option>DOCX</option><option>TXT</option><option>Notes</option>
            </select>
            <button class="btn btn-primary" type="submit" id="trainSubmitBtn">
              <span id="trainBtnText">${t('upload_train')}</span>
              <span id="trainBtnLoader" class="loader hidden-i"></span>
            </button>
          </form>
        </section>

        <section class="space-y-3">
          ${mineTraining.length ? mineTraining.map(tr => {
                    const job = jobs().find(j => j.id === tr.jobId);
                    return `
              <div class="glass-strong rounded-[26px] p-4 sm:p-5 hover:scale-[1.01] transition-transform duration-200">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 shrink-0 rounded-xl grid place-items-center" style="background: rgba(139,92,246,.12); font-size: 20px;">📄</div>
                    <div>
                      <div class="font-semibold text-sm sm:text-base">${job?.title || t('training_session')}</div>
                      <div class="text-xs sm:text-sm" style="color: var(--muted);">${tr.fileName} · ${tr.fileType}</div>
                    </div>
                  </div>
                  <div class="text-right ml-auto">
                    <div class="font-black" style="color: var(--accent);">${tr.progress}%</div>
                    <div class="text-xs" style="color: var(--muted);">${t(tr.status.toLowerCase()) || tr.status}</div>
                  </div>
                </div>
                <div class="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div class="h-full rounded-full ${tr.progress < 100 ? 'shimmer' : ''}" style="width:${tr.progress}%; background: linear-gradient(135deg, var(--accent), var(--accent2)); transition: width 1s ease;"></div>
                </div>
                <div class="mt-3 text-xs sm:text-sm" style="color: var(--muted);">${tr.summary || tr.status}</div>
                ${tr.progress === 100 ? `<button class="btn btn-secondary mt-3 text-xs" data-delete-training="${tr.id}">${t('remove')}</button>` : ''}
              </div>
            `;
                }).join('') : `<div class="glass rounded-[28px] p-5 empty-state"><div class="empty-state-icon">◫</div><div class="text-sm font-semibold">${t('no_training')}</div><div class="text-xs mt-1" style="color: var(--muted);">${t('training_empty_desc')}</div></div>`}
        </section>
      `;
            }

            function recruiterCandidates() {
                return `
        <section class="glass rounded-[28px] p-5">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 class="text-xl sm:text-2xl font-black">${t('candidate_management')}</h2>
              <p class="text-xs sm:text-sm mt-1" style="color: var(--muted);">${t('candidate_desc')}</p>
            </div>
            <div class="auth-chip text-xs">${t('auto_threshold')}</div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            ${['ALL', 'ABOVE THRESHOLD', 'REJECTED', 'PENDING', 'SHORTLISTED', 'QUALIFIED'].map(f => `<button class="btn btn-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm ${state.candidateFilter === f ? 'ring-2 ring-cyan-400/30' : ''}" data-filter="${f}">${t('filter_' + f.toLowerCase().replace(' ', '_')) || f}</button>`).join('')}
          </div>

          <div class="mt-4 table-wrap">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left" style="color: var(--muted);">
                  <th class="py-3 px-3 cursor-pointer hover:text-[var(--text)] transition-colors whitespace-nowrap" data-sort="name">${t('col_candidate')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_job')}</th>
                  <th class="py-3 px-3 cursor-pointer hover:text-[var(--text)] transition-colors whitespace-nowrap" data-sort="score">${t('col_score')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_confidence')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_stress')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_communication')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_technical')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_culture')}</th>
                  <th class="py-3 px-3 whitespace-nowrap">${t('col_status')}</th>
                </tr>
              </thead>
              <tbody id="candidateRows"></tbody>
            </table>
          </div>
        </section>
      `;
            }

            function recruiterAnalytics() {
                const appData = apps();
                const avgScore = avg(appData.map(a => a.interviewScore || 0));
                const shortlistRate = appData.length ? Math.round(appData.filter(a => ['SHORTLISTED', 'QUALIFIED'].includes(a.status)).length / appData.length * 100) : 0;
                return `
        <section class="grid gap-4 md:grid-cols-3">
          <div class="glass rounded-[28px] p-5 hover:-translate-y-1 transition-transform duration-300"><div class="text-sm" style="color: var(--muted);">${t('avg_score')}</div><div class="mt-2 sm:mt-3 text-3xl sm:text-4xl font-black">${avgScore}%</div></div>
          <div class="glass rounded-[28px] p-5 hover:-translate-y-1 transition-transform duration-300"><div class="text-sm" style="color: var(--muted);">${t('shortlist_rate')}</div><div class="mt-2 sm:mt-3 text-3xl sm:text-4xl font-black">${shortlistRate}%</div></div>
          <div class="glass rounded-[28px] p-5 hover:-translate-y-1 transition-transform duration-300"><div class="text-sm" style="color: var(--muted);">${t('total_candidates')}</div><div class="mt-2 sm:mt-3 text-3xl sm:text-4xl font-black">${appData.length}</div></div>
        </section>
        <section class="glass rounded-[28px] p-5 w-full overflow-hidden">
          <h2 class="text-xl sm:text-2xl font-black mb-4">${t('analytics')}</h2>
          <div class="mt-5 grid gap-4 lg:grid-cols-2">
            <div class="glass-strong rounded-[26px] p-4 h-64 sm:h-80 w-full relative"><canvas id="barChart"></canvas></div>
            <div class="glass-strong rounded-[26px] p-4 h-64 sm:h-80 w-full relative"><canvas id="pieChart"></canvas></div>
          </div>
        </section>
      `;
            }

            function recruiterSettings() {
                const u = currentUser();
                return `
        <section class="glass rounded-[28px] p-5">
          <h2 class="text-xl sm:text-2xl font-black">${t('settings')}</h2>
          <form id="settingsForm" class="mt-5 grid gap-4 md:grid-cols-2">
            <div><label class="text-sm font-semibold mb-2 block" style="color: var(--muted);">${t('full_name')}</label><input class="input" name="name" value="${u.name}" required></div>
            <div><label class="text-sm font-semibold mb-2 block" style="color: var(--muted);">${t('email')}</label><input class="input" name="email" value="${u.email}" disabled style="opacity: .6;"></div>
            <div><label class="text-sm font-semibold mb-2 block" style="color: var(--muted);">${t('company')}</label><input class="input" name="company" value="${u.companyName || ''}" ${u.role === 'CANDIDATE' ? 'disabled style="opacity: .6;"' : ''}></div>
            <div><label class="text-sm font-semibold mb-2 block" style="color: var(--muted);">${t('role')}</label><input class="input" value="${u.role}" disabled style="opacity: .6;"></div>
            <div class="md:col-span-2"><button type="submit" class="btn btn-primary mt-2" id="settingsBtn"><span id="settingsBtnText">${t('save_changes')}</span><span id="settingsBtnLoader" class="loader hidden-i"></span></button></div>
          </form>
          <div class="mt-8 border-t pt-6" style="border-color: var(--border);">
            <h3 class="text-lg font-bold mb-4" style="color: var(--bad);">${t('danger_zone')}</h3>
            <div class="glass-strong rounded-[24px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div><div class="font-semibold">${t('delete_account')}</div><div class="text-sm" style="color: var(--muted);">${t('delete_desc')}</div></div>
              <button class="btn btn-danger w-full sm:w-auto shrink-0" onclick="deleteAccount()">${t('delete_account')}</button>
            </div>
          </div>
        </section>
      `;
            }

            function candidateAvailable() {
                const list = jobs();
                const me = currentUser();
                const completedJobs = new Set(apps().filter(a => a.candidateId === me.id).map(a => a.jobId));
                return `<section class="glass rounded-[28px] p-5 sm:p-6"><h2 class="text-xl sm:text-2xl font-black section-title mb-4">${t('available_interviews')}</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${list.map(j => {
                    const isCompleted = completedJobs.has(j.id);
                    return `<div class="glass-strong rounded-[26px] p-5 ${isCompleted ? 'opacity-60' : 'hover:scale-[1.01] transition-transform'} flex flex-col h-full"><h3 class="text-lg sm:text-xl font-bold">${j.title}</h3><p class="text-sm mt-2 mb-4 text-[var(--muted)] flex-1">${j.department}</p><button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} w-full" data-start="${j.id}" ${isCompleted ? 'disabled' : ''}>${isCompleted ? '✓ ' + t('completed') : t('start_interview')}</button></div>`
                }).join('')}
        </div></section>`;
            }

            function candidateResults() {
                const me = currentUser();
                const res = apps().filter(a => a.candidateId === me.id).map(a => ({ ...a, job: jobs().find(j => j.id === a.jobId) }));
                const latest = res[0]?.report || null;
                return `<section class="grid gap-4 grid-cols-2 lg:grid-cols-4">
          ${[[t('eye_contact'), latest?.eyeContact ?? 0, '👁'], [t('col_confidence'), latest?.confidence ?? 0, '💪'], [t('col_stress'), latest?.stress ?? 0, '🧘'], [t('clarity'), latest?.clarity ?? 0, '✨']].map(([l, v, i]) => `
            <div class="glass rounded-[28px] p-4 sm:p-5 stat-card hover:-translate-y-1 transition-transform duration-300">
              <div class="flex items-center justify-between"><div class="text-xs sm:text-sm truncate pr-1" style="color: var(--muted);">${l}</div><span class="shrink-0" style="font-size: 18px;">${i}</span></div>
              <div class="mt-2 sm:mt-3 text-2xl sm:text-4xl font-black">${v}%</div>
            </div>`).join('')}
        </section>
        <section class="glass rounded-[28px] p-5">
          <h2 class="text-xl sm:text-2xl font-black">${t('ai_feedback')}</h2>
          <div class="mt-4 glass-strong rounded-[24px] p-4 sm:p-5"><p class="leading-7 text-sm sm:text-lg">${latest?.feedback || t('no_results_yet')}</p></div>
        </section>
        <section class="glass rounded-[28px] p-5"><h2 class="text-xl sm:text-2xl font-black">${t('past_results')}</h2>
          <div class="mt-4 space-y-3">
            ${res.length ? res.map(r => `<div class="glass-strong rounded-[24px] p-4 flex items-center justify-between text-sm sm:text-base"><div class="font-semibold truncate pr-3">${r.job?.title || 'Job'}</div><div class="font-black text-[var(--accent)] shrink-0">${r.interviewScore || 0}%</div></div>`).join('') : `<div class="empty-state">${t('no_results_yet')}</div>`}
          </div>
        </section>`;
            }

            function candidateReports() {
                const me = currentUser(); const res = apps().filter(a => a.candidateId === me.id);
                return `<section class="glass rounded-[28px] p-5"><h2 class="text-xl sm:text-2xl font-black">${t('reports')}</h2><div class="mt-4 space-y-3">
            ${res.length ? res.map(r => `<div class="glass-strong rounded-[24px] p-4 flex items-center justify-between"><div class="font-semibold text-sm sm:text-base truncate pr-3">${jobs().find(j => j.id === r.jobId)?.title || 'Job'}</div><button class="btn btn-secondary text-xs sm:text-sm" data-download="${r.id}">${t('download')}</button></div>`).join('') : `<div class="empty-state">${t('no_reports_yet')}</div>`}
          </div></section>`;
            }

            function candidateProfile() {
                const u = currentUser();
                return `<section class="glass rounded-[28px] p-5"><h2 class="text-xl sm:text-2xl font-black">${t('profile')}</h2><div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div class="glass-strong rounded-[24px] p-4"><div class="text-sm" style="color: var(--muted);">${t('full_name')}</div><div class="mt-1 font-semibold truncate">${u.name}</div></div>
            <div class="glass-strong rounded-[24px] p-4"><div class="text-sm" style="color: var(--muted);">${t('email')}</div><div class="mt-1 font-semibold truncate">${u.email}</div></div>
            <div class="glass-strong rounded-[24px] p-4 sm:col-span-2"><div class="text-sm" style="color: var(--muted);">${t('role')}</div><div class="mt-1 font-semibold">${u.role}</div></div>
          </div></section>`;
            }

            // ===== YENİLƏNMİŞ İMMERSİV MÜSAHİBƏ GÖRÜNÜŞÜ =====
            function interviewView() {
                const d = state.interviewDraft;
                if (!d) return `<div class="glass rounded-[28px] p-5 empty-state"><div class="empty-state-icon">⚠</div><div class="text-sm font-semibold">${t('no_interview_loaded')}</div></div>`;

                return `
        <section class="immersive-interview glass rounded-[34px] overflow-hidden relative flex flex-col w-full h-[100dvh] min-h-screen border-none">
            <!-- Fullscreen Camera Background -->
            <video id="camVideo" autoplay playsinline muted class="absolute inset-0 w-full h-full object-cover z-0"></video>
            
            <div id="camPlaceholder" class="absolute inset-0 z-0 bg-black/90 flex items-center justify-center flex-col text-white">
                 <div class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl" style="background: rgba(99,102,241,.16);">📷</div>
                 <div class="text-lg font-bold">${t('cam_required')}</div>
                 <div class="text-sm opacity-70 mt-2">${t('press_start')}</div>
            </div>

            <!-- Top Gradient Overlay (for Header & Stats) -->
            <div class="absolute top-0 left-0 right-0 p-5 z-10 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start pointer-events-none">
                <div class="flex items-center gap-3">
                    <div class="auth-chip border-white/20 bg-black/40 text-white shadow-xl backdrop-blur-md pointer-events-auto">
                        <span class="dot pulse"></span> ${t('live')}
                    </div>
                </div>
                <div class="flex items-start gap-4 pointer-events-auto">
                    <!-- Live Stats over Camera -->
                    <div class="flex gap-3">
                        <div class="glass-strong bg-black/40 border-white/10 rounded-2xl p-2 px-3 text-center text-white backdrop-blur-md min-w-[70px]">
                            <div class="text-[9px] uppercase tracking-wider opacity-70">${t('eye_contact')}</div>
                            <div id="liveEye" class="font-black mt-0.5">82%</div>
                        </div>
                        <div class="glass-strong bg-black/40 border-white/10 rounded-2xl p-2 px-3 text-center text-white backdrop-blur-md min-w-[70px]">
                            <div class="text-[9px] uppercase tracking-wider opacity-70 mb-1">${t('speech_level')}</div>
                            <div class="h-1.5 w-12 mx-auto rounded-full bg-white/20 overflow-hidden">
                                <div id="micLevelBar" class="h-full rounded-full" style="width: 15%; background: linear-gradient(135deg, var(--accent), var(--accent2)); transition: width .1s ease;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="glass-strong bg-black/40 border-white/10 rounded-2xl p-2 px-4 text-center text-white backdrop-blur-md">
                        <div class="text-[10px] uppercase tracking-wider opacity-70">${t('time_left')}</div>
                        <div id="timerLabel" class="font-mono text-xl font-bold mt-0.5">00:00</div>
                    </div>
                    
                    <button class="btn btn-secondary border-white/20 bg-black/40 text-white hover:bg-white/10 backdrop-blur-md" onclick="saveInterviewDraft()">💾 ${t('save_draft')}</button>
                </div>
            </div>

            <!-- Bottom Immersive Question Panel -->
            <div class="mt-auto relative z-10 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-32 pb-6 px-6 sm:px-10">
                <div class="max-w-4xl mx-auto w-full flex flex-col gap-4">
                    
                    <!-- Question Display -->
                    <div class="mb-2 text-white">
                        <span class="text-[var(--accent)] font-bold text-xs tracking-[0.2em] uppercase bg-black/50 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
                            ${t('question')} <span id="qIdxLabel">1</span> / ${d.questions.length}
                        </span>
                        <h3 id="currentQText" class="text-2xl sm:text-3xl lg:text-4xl font-black mt-4 leading-tight text-shadow-lg"></h3>
                    </div>
                    
                    <!-- Active Textarea -->
                    <div class="relative mt-2 group">
                        <textarea id="currentAnswer" class="textarea w-full bg-black/40 border-white/20 text-white placeholder-white/40 focus:border-[var(--accent)] focus:bg-black/60 transition-all duration-300 rounded-[20px] p-5 text-base sm:text-lg resize-none backdrop-blur-md shadow-2xl" placeholder="${t('write_answer_here')}" rows="3"></textarea>
                        <div class="absolute bottom-4 right-5 text-xs opacity-50 text-white pointer-events-none transition-opacity group-focus-within:opacity-100">
                            <span id="charCount">0</span> ${t('chars')}
                        </div>
                    </div>

                    <!-- Navigation Controls -->
                    <div class="flex items-center justify-between mt-4 gap-4">
                        <button id="prevQBtn" class="btn btn-secondary border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed px-4 sm:px-6">← <span class="hidden sm:inline ml-2">${t('prev_question')}</span></button>
                        
                        <!-- Dots indicator -->
                        <div class="flex gap-2.5 items-center" id="qDots"></div>
                        
                        <button id="nextQBtn" class="btn btn-primary shadow-[0_0_25px_rgba(99,102,241,0.3)] px-4 sm:px-6"><span class="hidden sm:inline mr-2">${t('next_question')}</span> →</button>
                        <button id="submitInterviewBtn" class="btn btn-primary shadow-[0_0_25px_rgba(168,85,247,0.30)] px-4 sm:px-6 hidden-i">
                            <span id="submitBtnText">${t('finish_interview')}</span>
                            <span id="submitBtnLoader" class="loader hidden-i"></span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
      `;
            }

            function premiumInterviewView() {
                const d = state.interviewDraft;
                if (!d) return `<div class="glass rounded-[28px] p-5 empty-state"><div class="empty-state-icon">⚠</div><div class="text-sm font-semibold">${t('no_interview_loaded')}</div></div>`;

                return `
        <section class="interview-command-center fixed inset-0 z-[80] h-[100dvh] w-screen overflow-hidden bg-slate-950 text-slate-100">
          <div class="interview-ambient" aria-hidden="true"></div>

          <header class="interview-topbar">
            <div class="flex min-w-0 items-center gap-3">
              <div class="live-orb"><span></span></div>
              <div class="min-w-0">
                <p class="telemetry-kicker">LIVE AI TELEMETRY</p>
                <p class="truncate text-sm font-semibold text-white">${d.job.title}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="telemetry-chip hidden sm:flex">
                <span class="text-slate-400">${t('time_left')}</span>
                <span id="timerLabel" class="font-mono font-bold" style="color: var(--accent);">00:00</span>
              </div>
              <button class="telemetry-action" onclick="saveInterviewDraft()">⌘ <span class="hidden sm:inline">${t('save_draft')}</span></button>
              <button class="telemetry-action" onclick="exitInterview()" aria-label="${t('cancel')}">× <span class="hidden sm:inline">${t('cancel')}</span></button>
            </div>
          </header>

          <div class="interview-grid">
            <aside class="telemetry-rail telemetry-scroll" aria-label="Real time interview telemetry">
              <div class="telemetry-rail-head">
                <div>
                  <p class="telemetry-kicker">AI MÜSAHİBƏÇİ</p>
                  <h2>${d.job.title}</h2>
                </div>
                <span id="aiProctorPill" class="ai-proctor-pill ok"><i></i><span id="proctorStatus">AI Proctor: Aktiv</span></span>
              </div>

              <article class="telemetry-card audio-capture-card">
                <div class="telemetry-card-title">
                  <div>
                    <p>CANLI SƏS</p>
                    <span>Danışdıqca mətnə çevrilir</span>
                  </div>
                  <button id="speechToggleBtn" class="speech-toggle" type="button"><span id="speechToggleIcon">●</span><span id="speechToggleLabel">Danış</span></button>
                </div>
                <div id="speechSpectrum" class="speech-spectrum" aria-label="Live speech spectrum">
                  <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                </div>
                <div class="mic-meter"><i id="micLevelBar"></i></div>
                <div id="sttStatus" class="stt-status">Mətnə çevirmə hazır</div>
              </article>

              <div class="side-question-workspace">
                <div class="question-glass">
                  <div class="question-meta">
                    <span>${t('question')} <b id="qIdxLabel">1</b> / ${d.questions.length}</span>
                    <span id="answerReadiness">STAR hazırlığı 0%</span>
                  </div>
                  <h1 id="currentQText"></h1>
                </div>

                <div id="answerShell" class="answer-shell" style="--answer-accent:#8b5cf6;--answer-progress:0%;">
                  <textarea id="currentAnswer" class="star-answer" placeholder="${t('write_answer_here')}" rows="5"></textarea>
                  <div class="answer-status"><span>CAVAB REDAKTORU</span><span><b id="charCount">0</b> ${t('chars')}</span></div>
                </div>

                <div class="answer-send-row">
                  <button id="submitAnswerBtn" class="speech-submit" type="button">Cavabı Göndər</button>
                  <span id="answerDeliveryStatus"></span>
                </div>

                <div class="question-controls">
                  <button id="prevQBtn" class="stage-button secondary">← <span>${t('prev_question')}</span></button>
                  <div id="qDots" class="question-dots" aria-label="Question progress"></div>
                  <button id="nextQBtn" class="stage-button primary"><span>${t('next_question')}</span> →</button>
                  <button id="submitInterviewBtn" class="stage-button primary hidden-i">
                    <span id="submitBtnText">${t('finish_interview')}</span><span id="submitBtnLoader" class="loader hidden-i"></span>
                  </button>
                </div>
              </div>
            </aside>

            <main id="candidateStage" class="candidate-stage">
              <video id="camVideo" autoplay playsinline muted class="candidate-camera"></video>
              <div id="camPlaceholder" class="camera-placeholder">
                <div class="camera-placeholder-icon">◉</div>
                <h3>${t('cam_required')}</h3>
                <p>${t('press_start')}</p>
              </div>
              <div id="proctorToast" class="camera-proctor-toast hidden-i" role="status"></div>
            </main>
          </div>
        </section>`;
            }

            function responseTelemetry() {
                const d = state.interviewDraft;
                const answer = d?.answers?.[state.currentQIdx] || '';
                const text = answer.toLowerCase();
                const markers = ['situation', 'task', 'action', 'result', 'problem', 'goal', 'impact', 'outcome'];
                const markerCount = markers.filter(marker => text.includes(marker)).length;
                const lengthScore = clamp(Math.round((answer.length / 320) * 70), 0, 70);
                return {
                    answer,
                    progress: clamp(Math.round((answer.length / 320) * 100), 0, 100),
                    star: clamp(lengthScore + markerCount * 8, 0, 100),
                    wpm: mic.level > 12 ? clamp(Math.round(74 + mic.level * .86), 74, 176) : 0
                };
            }

            function renderResponseTelemetry() {
                const data = responseTelemetry();
                const hue = Math.round(268 - data.progress * 1.16);
                const accent = `hsl(${hue} 82% 62%)`;
                const shell = document.getElementById('answerShell');
                const textarea = document.getElementById('currentAnswer');
                const count = document.getElementById('charCount');
                const star = document.getElementById('starMetric');
                const readiness = document.getElementById('answerReadiness');
                const wpm = document.getElementById('wpmMetric');
                const pace = document.getElementById('paceLabel');

                if (shell) { shell.style.setProperty('--answer-accent', accent); shell.style.setProperty('--answer-progress', `${data.progress}%`); }
                if (textarea) textarea.style.boxShadow = `0 0 0 1px color-mix(in srgb, ${accent} 56%, transparent), 0 18px 42px color-mix(in srgb, ${accent} 18%, transparent)`;
                if (count) count.textContent = data.answer.length;
                if (star) star.textContent = `${data.star}%`;
                if (readiness) readiness.textContent = `STAR readiness ${data.star}%`;
                if (wpm) wpm.textContent = data.wpm ? `${data.wpm} WPM` : '—';
                if (pace) pace.textContent = data.wpm ? (data.wpm >= 95 && data.wpm <= 155 ? 'Balanced pace' : data.wpm > 155 ? 'Fast delivery' : 'Measured pace') : 'Awaiting voice';
            }

            function renderLiveTelemetry(signal = {}) {
                const m = window.interviewMetrics || {};
                const focus = clamp(Number(signal.focus ?? m.latestFocus ?? 0), 0, 100);
                const stress = clamp(Number(signal.stress ?? m.latestStress ?? 0), 0, 100);
                const happy = clamp(Number(signal.happy ?? m.latestHappy ?? 0), 0, 100);
                const setWidth = (id, value) => { const el = document.getElementById(id); if (el) el.style.width = `${value}%`; };
                const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };

                setWidth('eyeTrackingLine', focus);
                setWidth('valenceBar', happy);
                setWidth('stressBar', stress);
                setText('eyeMapValue', `${focus}%`);
                setText('valenceValue', `${happy}%`);
                setText('stressValue', `${stress}%`);
                const wave = document.getElementById('emotionWave');
                const spectrum = document.getElementById('speechSpectrum');
                if (wave) wave.style.setProperty('--wave-energy', String(Math.max(happy, stress) / 100));
                if (spectrum) spectrum.style.setProperty('--signal-strength', String((mic.level || 0) / 100));
                const hint = document.getElementById('telemetryHint');
                if (hint) hint.textContent = focus < 35 ? 'Camera focus is searching for a stable face signal.' : stress > 60 ? 'Stress signal elevated — take a brief breath before continuing.' : happy > 45 ? 'Positive valence is stable. Keep your delivery measured and clear.' : 'Signals are stable. Add a concrete action and result to strengthen STAR fit.';
                renderResponseTelemetry();
            }

            function updateQuestionUI() {

                const d = state.interviewDraft;

                const idx = state.currentQIdx;

                const ans = d.answers[idx] || "";

                document.getElementById("qIdxLabel").textContent = idx + 1;

                document.getElementById("currentQText").textContent = d.questions[idx];

                const ta = document.getElementById("currentAnswer");

                if (ta) {

                    // Mikrofon işləyərkən textarea-nın məzmununu dəyişmə
                    if (!speech.shouldListen) {
                        ta.value = ans;
                    }

                    // Yazı artdıqca avtomatik aşağı sürüşdür
                    ta.scrollTop = ta.scrollHeight;

                }

                renderResponseTelemetry();

                // Buttons
                const prev = document.getElementById("prevQBtn");
                const next = document.getElementById("nextQBtn");
                const submit = document.getElementById("submitInterviewBtn");

                prev.disabled = idx === 0;

                if (idx === d.questions.length - 1) {

                    next.classList.add("hidden-i");
                    submit.classList.remove("hidden-i");

                } else {

                    next.classList.remove("hidden-i");
                    submit.classList.add("hidden-i");

                }

                // Question dots
                document.getElementById("qDots").innerHTML = d.questions.map((_, i) => {

                    let dotClass = "pending";

                    if (i === idx) {

                        dotClass = "active";

                    } else if ((d.answers[i] || "").trim().length > 20) {

                        dotClass = "answered";

                    }

                    return `<i class="question-dot ${dotClass}"></i>`;

                }).join("");

            }

            function setSpeechUI({ listening = false, message = 'Mətnə çevirmə hazır' } = {}) {
                const status = document.getElementById('sttStatus');
                const button = document.getElementById('speechToggleBtn');
                const label = document.getElementById('speechToggleLabel');
                const icon = document.getElementById('speechToggleIcon');
                if (status) { status.textContent = message; status.classList.toggle('listening', listening); }
                if (button) button.classList.toggle('listening', listening);
                if (label) label.textContent = listening ? 'Dayandır' : 'Danış';
                if (icon) icon.textContent = listening ? '■' : '●';
            }

            function syncSpeechTranscript(questionIndex = speech.questionIndex) {

                const d = state.interviewDraft;

                const ta = document.getElementById("currentAnswer");

                if (!d || questionIndex !== state.currentQIdx) return;

                const fullText = (
                    speech.baseText +
                    speech.finalText +
                    speech.interimText
                )
                    .replace(/\s+/g, " ")
                    .trim();

                d.answers[questionIndex] = fullText;

                if (ta) {
                    ta.value = fullText;
                    ta.scrollTop = ta.scrollHeight;
                }

                renderResponseTelemetry();
            }

            function scheduleSpeechRestart(delay = 250) {
                clearTimeout(speech.restartTimer);
                if (!speech.shouldListen || !state.interviewDraft || state.activeNav !== 'interview' || state.interviewSubmitting) return;
                speech.restartTimer = setTimeout(() => {
                    speech.restartTimer = null;
                    startSpeechToText();
                }, delay);
            }

            function stopSpeechToText({ keepMessage = false, discardInstance = false } = {}) {
                speech.shouldListen = false;
                speech.isStarting = false;
                clearTimeout(speech.silenceTimer); speech.silenceTimer = null;
                clearTimeout(speech.restartTimer); speech.restartTimer = null;
                if (speech.recognition) {
                    try { speech.recognition.stop(); } catch { }
                }
                speech.finalText = ''; speech.interimText = '';
                speech.questionIndex = -1;
                if (discardInstance && speech.recognition) {
                    speech.recognition.onstart = null;
                    speech.recognition.onresult = null;
                    speech.recognition.onerror = null;
                    speech.recognition.onend = null;
                    speech.recognition = null;
                }
                if (!keepMessage) setSpeechUI();
            }

            function startSpeechToText() {
                const Recognition = getSpeechRecognitionConstructor();
                const d = state.interviewDraft;

                if (!Recognition) {
                    setSpeechUI({ message: 'Bu brauzerdə səsdən-mətnə çevirmə dəstəklənmir' });
                    toast('Bu brauzerdə Speech-to-Text dəstəklənmir.', 'warn');
                    return;
                }

                if (!d) return;

                if (speech.shouldListen || speech.isStarting) return;

                // Mövcud cavabı saxla və davamına yaz
                speech.baseText =
                    d.answers[state.currentQIdx]
                        ? d.answers[state.currentQIdx].trim() + " "
                        : "";

                speech.finalText = "";
                speech.interimText = "";
                speech.shouldListen = true;
                speech.questionIndex = state.currentQIdx;

                const recognition = speech.recognition || new Recognition();
                speech.recognition = recognition;

                recognition.lang = speechLanguageFor(currentLang);

                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onstart = () => {
                    speech.isStarting = false;

                    setSpeechUI({
                        listening: true,
                        message: "Dinləyir və mətnə çevirir"
                    });

                };

                recognition.onresult = (event) => {

                    let interim = "";

                    for (let i = event.resultIndex; i < event.results.length; i++) {

                        const transcript = event.results[i][0].transcript;

                        if (event.results[i].isFinal) {

                            speech.finalText += transcript + " ";

                        } else {

                            interim += transcript;

                        }

                    }

                    speech.interimText = interim;

                    syncSpeechTranscript(speech.questionIndex);

                    clearTimeout(speech.silenceTimer);

                    speech.silenceTimer = setTimeout(() => {

                        submitCurrentAnswer("silence");

                    }, 3000);

                };
                recognition.onerror = (event) => {

                    if (
                        event.error === "not-allowed" ||
                        event.error === "service-not-allowed"
                    ) {

                        speech.shouldListen = false;

                        setSpeechUI({
                            message: "Mikrofon icazəsi tələb olunur"
                        });

                        return;
                    }

                    if (["network", "no-speech", "audio-capture", "aborted"].includes(event.error)) {
                        scheduleSpeechRestart();
                    }

                };

                recognition.onend = () => {

                    if (!speech.shouldListen || !state.interviewDraft) {
                        setSpeechUI();
                        return;
                    }

                    scheduleSpeechRestart(180);

                };

                try {

                    speech.isStarting = true;
                    recognition.start();

                } catch (e) {

                    speech.isStarting = false;

                    setSpeechUI({
                        message: "Səs xidmətinə qoşulmaq alınmadı"
                    });

                    scheduleSpeechRestart(500);
                }
            }

            function queueSpeechStart(delay = 250) {
                clearTimeout(speech.restartTimer);
                if (!state.interviewDraft || state.activeNav !== 'interview' || state.interviewSubmitting) return;
                speech.restartTimer = setTimeout(() => {
                    speech.restartTimer = null;
                    startSpeechToText();
                }, delay);
            }

            function moveToQuestion(nextIndex) {
                const draft = state.interviewDraft;
                if (!draft || nextIndex < 0 || nextIndex >= draft.questions.length) return;
                persistInterviewDraft(false);
                stopSpeechToText({ keepMessage: true });
                state.currentQIdx = nextIndex;
                updateQuestionUI();
                queueSpeechStart();
            }

            async function submitCurrentAnswer(source = 'manual') {
                const d = state.interviewDraft;
                let answer = d?.answers?.[state.currentQIdx]?.trim();
                const delivery = document.getElementById('answerDeliveryStatus');
                if (!d || !answer) { toast('Göndərmək üçün cavabınızı yazın və ya danışın.', 'warn'); return; }

                const transcript = await transcribeAudioSegment();
                if (transcript) {
                    answer = [answer, transcript].filter(Boolean).join(' ').trim();
                    d.answers[state.currentQIdx] = answer;
                }
                stopSpeechToText({ keepMessage: true });
                if (delivery) delivery.textContent = source === 'silence' ? 'Sükutla göndərildi' : 'Göndərilir…';
                try {
                    const payload = { question: currentInterviewQuestion(), answer, order: state.currentQIdx + 1 };
                    const existing = state.answerRecords[state.currentQIdx];
                    if (existing) {
                        await interviewApi.answers.update(existing.id, payload);
                        state.answerRecords[state.currentQIdx] = { ...existing, ...payload };
                    } else {
                        const created = await interviewApi.answers.create({ interviewSessionId: state.interviewSession.id, ...payload });
                        state.answerRecords[state.currentQIdx] = created;
                    }
                    window.dispatchEvent(new CustomEvent('silentInterview:answer-ready', { detail: { ...payload, source } }));
                    if (state.currentQIdx < d.questions.length - 1) moveToQuestion(state.currentQIdx + 1);
                    if (delivery) delivery.textContent = 'Cavab göndərildi';
                } catch {
                    if (delivery) delivery.textContent = 'Göndəriş yenidən yoxlanmalıdır';
                }
            }

            // Backend JSON cavabını birbaşa müsahibə panelinə tətbiq etmək üçün giriş nöqtəsi.
            window.applyInterviewAIOutput = function (payload = {}) {
                const d = state.interviewDraft; if (!d) return null;
                const proctorStatus = payload.proctor_status === 'HALT' ? 'REVIEW_REQUIRED' : payload.proctor_status || 'OK';
                const nextQuestion = String(payload.interview_question || '').trim();
                if (nextQuestion && state.currentQIdx < d.questions.length - 1) {
                    d.questions[state.currentQIdx + 1] = nextQuestion;
                    moveToQuestion(state.currentQIdx + 1);
                }
                return publishInterviewOutput({
                    proctor_status: proctorStatus,
                    warning_message: payload.warning_message || '',
                    interview_question: nextQuestion || currentInterviewQuestion(),
                    spoken_audio_text: payload.ai_response_speech || payload.spoken_audio_text || ''
                });
            };

            function bindRecruiter() {
                const jobForm = document.getElementById('jobForm');
                if (jobForm) {
                    jobForm.onsubmit = async (e) => {
                        e.preventDefault();
                        const btnText = document.getElementById('jobBtnText'); const btnLoader = document.getElementById('jobBtnLoader');
                        btnText.classList.add('hidden-i'); btnLoader.classList.remove('hidden-i');
                        try {
                            const fd = new FormData(jobForm);
                            const company = getBackendCollection('companies')[0];
                            if (!company) throw new Error('Create a company in the backend before creating a job.');
                            await jobApi.create({
                                title: String(fd.get('title') || ''),
                                description: [fd.get('department'), fd.get('companyCulture')].filter(Boolean).join(' — '),
                                requirements: [fd.get('experienceLevel'), fd.get('skillsRequired')].filter(Boolean).join(' | '),
                                salary: 0,
                                companyId: company.id,
                            });
                            await hydrateRuntimeStore();
                            toast(t('msg_job_created'), 'success'); state.activeNav = 'jobs'; renderContent('RECRUITER'); renderNav('RECRUITER');
                        } catch (error) {
                            toast(error.message || 'Job could not be created.', 'error');
                        } finally {
                            btnText.classList.remove('hidden-i'); btnLoader.classList.add('hidden-i');
                        }
                    };
                }
                const jobSearch = document.getElementById('jobSearch');
                if (jobSearch) { jobSearch.oninput = (e) => { state.searchQuery = e.target.value; renderContent('RECRUITER'); renderNav('RECRUITER'); }; }
                document.querySelectorAll('[data-delete-job]').forEach(btn => {
                    btn.onclick = (e) => {
                        e.stopPropagation(); const jobId = btn.getAttribute('data-delete-job');
                        showConfirm(t('title_del_job'), t('msg_del_job'), async () => {
                            try {
                                await jobApi.remove(jobId); await hydrateRuntimeStore(); toast(t('msg_job_deleted'), 'info'); renderContent('RECRUITER'); renderNav('RECRUITER');
                            } catch (error) { toast(error.message || 'Job could not be deleted.', 'error'); }
                        });
                    };
                });
                const trainingForm = document.getElementById('trainingForm');
                if (trainingForm) {
                    trainingForm.onsubmit = (e) => { e.preventDefault(); toast('Document training is not exposed by the supplied backend.', 'error'); };
                }
                document.querySelectorAll('[data-delete-training]').forEach(btn => {
                    btn.onclick = () => toast('Document training is not exposed by the supplied backend.', 'error');
                });
                state.candidateFilter = state.candidateFilter || 'ALL';
                document.querySelectorAll('[data-filter]').forEach(btn => { btn.onclick = () => { state.candidateFilter = btn.getAttribute('data-filter'); renderCandidateRows(); document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('ring-2', 'ring-cyan-400/30')); btn.classList.add('ring-2', 'ring-cyan-400/30'); }; });
                renderCandidateRows();
                const settingsForm = document.getElementById('settingsForm');
                if (settingsForm) {
                    settingsForm.onsubmit = (e) => { e.preventDefault(); toast('User-profile updates are not exposed by the supplied backend.', 'error'); };
                }
                renderCharts();
            }

            function renderCandidateRows() {
                const rows = document.getElementById('candidateRows'); if (!rows) return;
                const mine = apps().map(a => ({ ...a, user: users().find(u => u.id === a.candidateId), job: jobs().find(j => j.id === a.jobId) })).filter(a => a.job && (a.job.recruiterId === currentUser().id || a.job.recruiterId === 'seed'));
                const filter = state.candidateFilter || 'ALL';
                const filtered = mine.filter(a => {
                    if (filter === 'ALL') return true; if (filter === 'ABOVE THRESHOLD') return (a.interviewScore || 0) >= 70;
                    if (filter === 'REJECTED') return a.status === 'REJECTED'; if (filter === 'PENDING') return a.status === 'PENDING';
                    if (filter === 'SHORTLISTED') return a.status === 'SHORTLISTED'; if (filter === 'QUALIFIED') return a.status === 'QUALIFIED'; return true;
                });
                const statusClass = (status) => { const map = { 'QUALIFIED': 'status-qualified', 'SHORTLISTED': 'status-shortlisted', 'REJECTED': 'status-rejected', 'PENDING': 'status-pending' }; return map[status] || 'pill'; };
                rows.innerHTML = filtered.length ? filtered.map(a => `
        <tr class="border-t hover:bg-white/[0.02] transition-colors" style="border-color: var(--border);">
          <td class="py-3 px-3"><div class="flex items-center gap-2"><div class="h-8 w-8 rounded-lg grid place-items-center text-xs font-bold shrink-0" style="background: linear-gradient(135deg, rgba(99,102,241,.18), rgba(168,85,247,.16));">${(a.user?.name || 'C').charAt(0)}</div><span class="whitespace-nowrap">${a.user?.name || 'Candidate'}</span></div></td>
          <td class="py-3 px-3 whitespace-nowrap">${a.job?.title || '-'}</td><td class="py-3 px-3 font-bold" style="color: var(--accent);">${a.interviewScore || 0}%</td>
          <td class="py-3 px-3">${a.confidence || 0}%</td><td class="py-3 px-3">${a.stress || 0}%</td>
          <td class="py-3 px-3">${a.communication || 0}%</td><td class="py-3 px-3">${a.technicalScore || 0}%</td>
          <td class="py-3 px-3">${a.cultureFit || 0}%</td><td class="py-3 px-3"><span class="pill ${statusClass(a.status)}">${t('filter_' + a.status.toLowerCase().replace(' ', '_')) || a.status}</span></td>
        </tr>
      `).join('') : `<tr><td colspan="9" class="py-8 text-center" style="color: var(--muted);"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="text-sm font-semibold">${t('no_candidates_found')}</div></div></td></tr>`;
            }

            window.deleteAccount = function () { toast('Account deletion is not exposed by the supplied backend.', 'error'); }


            function bindCandidate() {
                // Mövcud düymə hadisələri
                document.querySelectorAll('[data-start]').forEach(btn => {
                    btn.onclick = () => startInterview(btn.getAttribute('data-start'));
                });

                document.querySelectorAll('[data-download]').forEach(btn => {
                    btn.onclick = () => downloadReport(btn.getAttribute('data-download'));
                });

                // Səsli komanda düyməsinin aktivləşdirilməsi
                const toggleBtn = document.getElementById('speechToggleBtn');
                if (toggleBtn) {
                    toggleBtn.onclick = () => {

                        if (speech.shouldListen) {

                            stopSpeechToText();

                            toggleBtn.style.background = "transparent";

                        } else {

                            startSpeechToText();

                            toggleBtn.style.background = "red";

                        }

                    };
                }

                // Müsahibə rejimindədirsə, həm interfeysi qur, həm də inputu bağla
                if (state.activeNav === 'interview' && state.interviewDraft) {
                    setupInterview();
                    // bindAnswerInput();
                }
            }

            // ===== PROCTORING TELEMETRY ADAPTER =====
            // Connect MediaPipe/OpenCV here and call window.provideProctorTelemetry({
            //   faceCount, faceAreaRatio, lookingAtScreen, lookAwayMs
            // }). The UI intentionally receives operational signals only; it does
            // not infer emotion or use camera data in the interview score.
            function startFaceTracking() {
                window.interviewMetrics = { totalFrames: 0, faceDetectedCount: 0 };
                const signal = document.getElementById('cameraSignal');
                if (signal) signal.textContent = 'Telemetriya gözlənilir';
                window.addEventListener('silentInterview:proctor-telemetry', (event) => {
                    const detail = event.detail || {};
                    if (signal) {
                        signal.textContent = detail.faceCount === 1 ? 'Görüntü yoxlanıldı' : 'Görüntü yenidən yoxlanır';
                    }
                }, { once: true });
            }

            // ===== INTERVIEW SYSTEM =====
            window.startInterview = async function (jobId) {
                const job = jobs().find(j => j.id === jobId); if (!job) return;
                const me = currentUser();
                try {
                    let candidate = getBackendCollection('candidates').find((item) => item.userId === me.id);
                    if (!candidate) {
                        candidate = await candidateApi.create({ userId: me.id, resumeUrl: '', skills: '', education: '', experience: '' });
                        await hydrateRuntimeStore();
                    }
                    let application = apps().find((item) => item.candidateId === me.id && item.jobId === jobId);
                    if (!application) {
                        await interviewApi.applications.create({ candidateId: candidate.id, jobId });
                        await hydrateRuntimeStore();
                        application = apps().find((item) => item.candidateId === me.id && item.jobId === jobId);
                    }
                    let interviewSession = interviews().find((item) => item.jobApplicationId === application?.id && !item.endedAt);
                    if (!interviewSession) {
                        interviewSession = await interviewApi.sessions.create({ jobApplicationId: application.id, startedAt: new Date().toISOString() });
                        await hydrateRuntimeStore();
                    }
                    const answerRecords = getBackendCollection('answers').filter((item) => item.interviewSessionId === interviewSession.id).sort((a, b) => a.order - b.order);
                    if (!answerRecords.length) {
                        toast('The supplied backend does not publish interview questions, so an AI interview cannot be started.', 'error', 5000);
                        return;
                    }
                    loadInterview(jobId, job, interviewSession, answerRecords);
                } catch (error) {
                    toast(error.message || 'Interview could not be started.', 'error');
                }
            }

            function loadInterview(jobId, job, interviewSession, answerRecords) {
                state.interviewSession = interviewSession;
                state.answerRecords = answerRecords;
                state.interviewDraft = createInterviewDraft({ jobId, job, savedDraft: { questions: answerRecords.map((item) => item.question), answers: answerRecords.map((item) => item.answer || ''), timer: 0 } });
                state.currentQIdx = 0;
                resetProctoring();
                state.activeNav = 'interview'; renderContent('CANDIDATE'); renderNav('CANDIDATE'); toast(t('msg_int_start'), 'info');
            }

            function persistInterviewDraft(notify = false) {
                if (!state.interviewDraft) return;
                const draft = state.interviewDraft;
                const user = currentUser();
                if (!user) return;
                const drafts = load(LS.drafts, {});
                drafts[`${user.id}_${draft.jobId}`] = {
                    jobId: draft.jobId,
                    answers: draft.answers,
                    timer: draft.timer,
                    currentQuestionIndex: state.currentQIdx,
                    savedAt: new Date().toISOString()
                };
                save(LS.drafts, drafts);
                if (notify) toast(t('msg_draft_saved'), 'success');
            }

            window.saveInterviewDraft = function () { persistInterviewDraft(true); };

            window.exitInterview = function () {
                if (!state.interviewDraft) return;
                stopSpeechToText({ discardInstance: true, suppressRestart: true });
                saveInterviewDraft();
                stopMedia();
                state.interviewDraft = null;
                state.activeNav = 'available';
                renderContent('CANDIDATE');
                renderNav('CANDIDATE');
            }

            function setupInterview() {
                const d = state.interviewDraft; if (!d) return;

                // İmmersiv UI initial setup
                updateQuestionUI();

                // TextArea dəyişikliyi
                const ta = document.getElementById('currentAnswer');
                if (ta) {
                    ta.oninput = (e) => {

                        const val = e.target.value;

                        // İstifadəçi klaviatura ilə yazırsa cavabı yenilə
                        d.answers[state.currentQIdx] = val;

                        renderResponseTelemetry();

                        updateQuestionUI();

                        // Autosave hissəsini saxlayırıq
                        if (!window._autoSaveTimer) {
                            window._autoSaveTimer = setTimeout(() => {
                                saveInterviewDraft();
                                window._autoSaveTimer = null;
                            }, 10000);
                        }

                    };
                }

                // Naviqasiya Düymələri
                document.getElementById('prevQBtn').onclick = () => {
                    if (state.currentQIdx > 0) {
                        stopSpeechToText({ keepMessage: true, suppressRestart: true });
                        state.currentQIdx--;
                        updateQuestionUI();
                        startSpeechToText();
                    }
                };

                document.getElementById('nextQBtn').onclick = () => {
                    if (state.currentQIdx < d.questions.length - 1) {
                        stopSpeechToText({ keepMessage: true, suppressRestart: true });
                        state.currentQIdx++;
                        updateQuestionUI();
                        startSpeechToText();
                    }
                };

                const timerLabel = document.getElementById('timerLabel');
                // document.getElementById('speechToggleBtn').onclick = startSpeechToText;
                document.getElementById('submitAnswerBtn').onclick = () => submitCurrentAnswer('manual');
                document.getElementById('submitInterviewBtn').onclick = () => { showConfirm(t('title_confirm'), t('msg_submit_int'), () => { submitInterview(); }, false); };

                startCamera().then((started) => {
                    if (started) {
                        startFaceTracking();
                        startMic();

                        // Speech to Text avtomatik başlasın
                        setTimeout(() => {
                            startSpeechToText();
                        }, 1000);
                    }
                });

                clearInterval(window.siTimer);
                window.siTimer = setInterval(() => {
                    if (!state.interviewDraft) return;
                    d.timer = Math.max(0, d.timer - 1);
                    const mm = String(Math.floor(d.timer / 60)).padStart(2, '0'); const ss = String(d.timer % 60).padStart(2, '0');
                    if (timerLabel) { timerLabel.textContent = `${mm}:${ss}`; if (d.timer <= 60) timerLabel.classList.add('timer-urgent', 'text-[var(--bad)]'); else timerLabel.classList.remove('timer-urgent', 'text-[var(--bad)]'); }
                    if (d.timer <= 0) { toast(t('msg_time_up'), 'warn'); submitInterview(); }
                }, 1000);
                if (timerLabel) timerLabel.textContent = `${String(Math.floor(d.timer / 60)).padStart(2, '0')}:${String(d.timer % 60).padStart(2, '0')}`;
            }

            window.startCamera = async function () {
                stopMedia(); const video = document.getElementById('camVideo'); const placeholder = document.getElementById('camPlaceholder');
                if (!video || !supportsCameraAccess()) { if (placeholder) placeholder.innerHTML = `<div class="text-white">${t('cam_required')}</div>`; return false; }
                try {
                    const stream = await requestInterviewMedia();
                    video.srcObject = stream; await video.play(); placeholder?.classList.add('hidden-i'); mic.stream = stream; startAudioCapture(stream);
                    toast(t('msg_cam_active'), 'success'); return true;
                } catch (e) {
                    if (placeholder) placeholder.innerHTML = `<div class="text-white text-center">${t('msg_cam_denied')} <br><button onclick="startCamera()" class="btn btn-primary mt-4 text-sm bg-white/20 border-white/20 backdrop-blur">Yenidən yoxla</button></div>`;
                    toast(t('msg_cam_denied'), 'error'); return false;
                }
            }

            function startAudioCapture(stream) {
                if (!stream || !window.MediaRecorder || recordedAudio.recorder?.state === 'recording') return;
                const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined;
                const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
                recordedAudio = { recorder, chunks: [] };
                recorder.ondataavailable = (event) => { if (event.data.size) recordedAudio.chunks.push(event.data); };
                recorder.start();
            }

            async function transcribeAudioSegment() {
                const recorder = recordedAudio.recorder;
                if (!recorder || recorder.state !== 'recording') return '';
                return new Promise((resolve) => {
                    recorder.onstop = async () => {
                        try {
                            const blob = new Blob(recordedAudio.chunks, { type: recorder.mimeType || 'audio/webm' });
                            const result = await openaiApi.transcribe(new File([blob], 'answer.webm', { type: blob.type }));
                            resolve(result.transcript || '');
                        } catch (error) {
                            toast(error.message || 'Audio transcription failed.', 'error');
                            resolve('');
                        } finally {
                            startAudioCapture(mic.stream);
                        }
                    };
                    recorder.stop();
                });
            }

            async function startMic() {
                if (!mic.stream) return;
                try {
                    mic.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); const source = mic.audioCtx.createMediaStreamSource(mic.stream);
                    mic.analyser = mic.audioCtx.createAnalyser(); mic.analyser.fftSize = 256; source.connect(mic.analyser);
                    const data = new Uint8Array(mic.analyser.frequencyBinCount); const meter = document.getElementById('micLevelBar');
                    const loop = () => {
                        if (!mic.analyser) return; mic.analyser.getByteFrequencyData(data); const avgLevel = data.reduce((a, b) => a + b, 0) / data.length;
                        const pct = Math.min(100, Math.max(10, Math.round(avgLevel / 1.6)));
                        mic.level = pct;
                        if (meter) meter.style.width = `${pct}%`;
                        renderLiveTelemetry();
                        mic.raf = requestAnimationFrame(loop);
                    }; loop();
                } catch (e) { console.error('Mic error:', e); }
            }

            function stopMedia() {
                if (mic.raf) cancelAnimationFrame(mic.raf); mic.raf = null;
                if (window.faceTimeout) clearTimeout(window.faceTimeout);
                if (mic.analyser?.disconnect) try { mic.analyser.disconnect(); } catch { }
                if (mic.audioCtx?.close) try { mic.audioCtx.close(); } catch { }
                mic.analyser = null; mic.audioCtx = null;
                if (recordedAudio.recorder?.state === 'recording') recordedAudio.recorder.stop();
                recordedAudio = { recorder: null, chunks: [] };
                stopMediaStream(mic.stream);
                mic.stream = null; mic.level = 0; clearInterval(window.siTimer); window.siTimer = null;
            }

            // Cavab keyfiyyəti yalnız yazılı cavabın məzmununa əsaslanır.
            // Kamera/mikrofon telemetriyası bu nəticəyə daxil edilmir.
            function scoreInterview(answers) {
                throw new Error('Scoring must be supplied by the backend.');
            }

            function submitInterview() {
                return submitInterviewToBackend();
                state.interviewSubmitting = true;
                stopSpeechToText({ discardInstance: false, suppressRestart: true });
                clearInterviewDraftState();

                if (!state.interviewDraft) return;
                const d = state.interviewDraft;

                const btnText = document.getElementById('submitBtnText');
                const btnLoader = document.getElementById('submitBtnLoader');

                if (btnText && btnLoader) {
                    btnText.classList.add('hidden-i');
                    btnLoader.classList.remove('hidden-i');
                }

                setTimeout(() => {
                    const analysis = scoreInterview(d.answers, d.questions, d.job);
                    const me = currentUser();
                    const list = apps();
                    const idx = list.findIndex(a => a.candidateId === me.id && a.jobId === d.jobId);

                    const status = analysis.score >= d.job.minPassingScore
                        ? 'QUALIFIED'
                        : analysis.score >= 65
                            ? 'SHORTLISTED'
                            : 'REJECTED';

                    const record = {
                        id: idx >= 0 ? list[idx].id : uid('a'),
                        candidateId: me.id,
                        jobId: d.jobId,
                        status,
                        interviewScore: analysis.score,
                        confidence: analysis.confidence,
                        stress: analysis.stress,
                        communication: analysis.communication,
                        technicalScore: analysis.technicalScore,
                        cultureFit: analysis.cultureFit,
                        report: analysis,
                        updatedAt: new Date().toISOString()
                    };

                    if (idx >= 0) list[idx] = record;
                    else list.unshift(record);

                    save(LS.apps, list);

                    const drafts = load(LS.drafts, {});
                    delete drafts[`${me.id}_${d.jobId}`];
                    save(LS.drafts, drafts);

                    const sess = interviews();
                    sess.unshift({
                        id: uid('i'),
                        candidateId: me.id,
                        recruiterId: d.job.recruiterId,
                        jobId: d.jobId,
                        questions: d.questions,
                        answers: d.answers,
                        ...analysis
                    });

                    save(LS.interviews, sess);

                    stopMedia();
                    state.interviewSubmitting = false;
                    state.interviewDraft = null;
                    state.activeNav = 'results';
                    renderContent('CANDIDATE');
                    renderNav('CANDIDATE');

                    if (analysis.score >= 70) {
                        createConfetti();
                    }

                    toast(
                        `${t('msg_int_done')} ${analysis.score}% — ${t('filter_' + status.toLowerCase()) || status}`,
                        analysis.score >= 70 ? 'success' : 'info'
                    );
                }, 650);
            }

            async function submitInterviewToBackend() {
                const draft = state.interviewDraft;
                const interviewSession = state.interviewSession;
                if (!draft || !interviewSession) return;
                state.interviewSubmitting = true;
                try {
                    for (let index = 0; index < draft.questions.length; index += 1) {
                        const answer = String(draft.answers[index] || '').trim();
                        if (!answer) continue;
                        const payload = { question: draft.questions[index], answer, order: index + 1 };
                        const existing = state.answerRecords[index];
                        if (existing) await interviewApi.answers.update(existing.id, payload);
                        else state.answerRecords[index] = await interviewApi.answers.create({ interviewSessionId: interviewSession.id, ...payload });
                    }
                    await interviewApi.sessions.update(interviewSession.id, { startedAt: interviewSession.startedAt, endedAt: new Date().toISOString() });
                    const application = apps().find((item) => item.id === interviewSession.jobApplicationId);
                    if (application) await interviewApi.applications.update(application.id, { status: 'Completed' });
                    await hydrateRuntimeStore();
                    stopMedia();
                    state.interviewDraft = null;
                    state.interviewSession = null;
                    state.answerRecords = [];
                    state.activeNav = 'results';
                    renderContent('CANDIDATE');
                    renderNav('CANDIDATE');
                    toast('Interview submitted. Scores and feedback will appear when the backend publishes a report.', 'success', 5000);
                } catch (error) {
                    toast(error.message || 'Interview could not be submitted.', 'error');
                } finally {
                    state.interviewSubmitting = false;
                }
            }

            function createConfetti() {
                const colors = ['#6366f1', '#8b5cf6', '#38bdf8', '#f59e0b', '#fb7185'];
                for (let i = 0; i < 20; i++) {
                    const el = document.createElement('div'); el.className = 'confetti'; el.style.left = Math.random() * 100 + 'vw';
                    el.style.background = colors[Math.floor(Math.random() * colors.length)]; el.style.animationDuration = (Math.random() * 2 + 2) + 's'; el.style.animationDelay = Math.random() * 2 + 's'; el.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                    document.body.appendChild(el); setTimeout(() => el.remove(), 5000);
                }
            }

            window.downloadReport = function (id) {
                const app = apps().find(a => a.id === id); if (!app) return; const job = jobs().find(j => j.id === app.jobId); const candidate = users().find(u => u.id === app.candidateId);
                const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>SilentInterview Report - ${job?.title || 'Candidate'}</title>
          <style>
        .auth-shell, .landing-shell, .app-shell { position: relative; }
        :root {
            --bg0: #f7f8ff;
            --bg1: #eef2ff;
            --bg2: #fcfdff;
            --text: #111827;
            --muted: #64748b;
            --muted-2: #94a3b8;
            --card: rgba(255, 255, 255, 0.76);
            --card-strong: rgba(255, 255, 255, 0.92);
            --border: rgba(99, 102, 241, 0.14);
            --border-strong: rgba(99, 102, 241, 0.22);
            --accent: #4f46e5;
            --accent2: #8b5cf6;
            --accent3: #38bdf8;
            --good: #2563eb;
            --warn: #d97706;
            --bad: #e11d48;
            --shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
            --shadow-soft: 0 10px 30px rgba(15, 23, 42, 0.06);
            --radius-xl: 30px;
            --radius-lg: 22px;
            --radius-md: 16px;
        }

        html[data-theme="dark"] {
            --bg0: #090b14;
            --bg1: #0f1426;
            --bg2: #141b32;
            --text: #f8fafc;
            --muted: #a8b3cf;
            --muted-2: #74809d;
            --card: rgba(17, 24, 39, 0.68);
            --card-strong: rgba(20, 27, 50, 0.9);
            --border: rgba(148, 163, 184, 0.16);
            --border-strong: rgba(165, 180, 252, 0.24);
            --accent: #818cf8;
            --accent2: #c084fc;
            --accent3: #67e8f9;
            --shadow: 0 26px 70px rgba(0, 0, 0, 0.34);
            --shadow-soft: 0 14px 34px rgba(0, 0, 0, 0.24);
        }

        * { box-sizing: border-box; cursor: none !important; }
        html, body { min-height: 100%; }
        html { scroll-behavior: smooth; }
        body {
            margin: 0;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: var(--text);
            background:
                radial-gradient(circle at 18% 10%, rgba(99, 102, 241, 0.10), transparent 30%),
                radial-gradient(circle at 82% 18%, rgba(168, 85, 247, 0.08), transparent 28%),
                linear-gradient(180deg, var(--bg1), var(--bg0) 22%, var(--bg2));
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
            transition: background .3s, color .3s;
        }

        @media (pointer: coarse), (max-width: 768px) {
            * { cursor: auto !important; }
            .custom-cursor, .custom-cursor-dot { display: none !important; }
        }

        #heroBg {
            position: fixed; inset: 0; z-index: -2; pointer-events: none;
            background:
                radial-gradient(circle at 18% 16%, rgba(99, 102, 241, 0.16), transparent 38%),
                radial-gradient(circle at 84% 78%, rgba(168, 85, 247, 0.12), transparent 40%),
                radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.05), transparent 28%);
            transition: background .45s ease;
        }

        .grain::after {
            content: ""; position: fixed; inset: 0; pointer-events: none; z-index: -1;
            background-image: radial-gradient(rgba(148, 163, 184, 0.09) 1px, transparent 1px);
            background-size: 3px 3px; opacity: .18; mix-blend-mode: soft-light;
        }

        .custom-cursor, .custom-cursor-dot { z-index: 9999; pointer-events: none; position: fixed; top: -100px; left: -100px; }
        .custom-cursor {
            width: 24px; height: 24px; border: 1.5px solid rgba(99, 102, 241, .7); border-radius: 999px;
            transition: transform .12s ease, background .2s ease, border-color .2s ease; mix-blend-mode: difference;
        }
        .custom-cursor-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 999px; }
        .custom-cursor.hover { transform: scale(1.9); background: rgba(99, 102, 241, 0.08); }

        .logo {
            font-family: "Space Grotesk", Inter, sans-serif; font-size: 1.55rem; font-weight: 800;
            letter-spacing: -0.04em; background: linear-gradient(135deg, var(--accent), var(--accent2));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        @media (min-width: 640px) { .logo { font-size: 1.8rem; } }

        .glass, .glass-strong, .glass-card {
            border-radius: var(--radius-xl); border: 1px solid var(--border); backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px); position: relative; overflow: hidden; box-shadow: var(--shadow);
        }
        .glass { background: var(--card); }
        .glass-strong, .glass-card { background: var(--card-strong); box-shadow: var(--shadow-soft); }
        .glass:hover, .glass-card:hover { border-color: var(--border-strong); }

        .fade-up { animation: fadeUp .42s ease-out; }
        .fade-in { animation: fadeIn .22s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes floaty { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }

        .btn {
            display: inline-flex; align-items: center; justify-content: center; gap: .55rem; border-radius: 999px;
            padding: 12px 18px; border: 1px solid transparent; font-weight: 700; letter-spacing: -0.01em;
            transition: transform .25s ease, box-shadow .25s ease, background .25s ease, border-color .25s ease, opacity .2s ease;
            user-select: none; text-decoration: none; white-space: nowrap;
        }
        .btn:hover:not(:disabled) { transform: translateY(-1px); }
        .btn:active:not(:disabled) { transform: translateY(0); }
        .btn:focus-visible { outline: 2px solid rgba(99, 102, 241, .55); outline-offset: 3px; }
        .btn:disabled { opacity: .55; cursor: not-allowed !important; transform: none !important; }
        .btn-primary {
            color: #fff; background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
            box-shadow: 0 14px 30px rgba(79, 70, 229, .22);
        }
        .btn-secondary, .btn-ghost {
            color: var(--text); background: rgba(255,255,255,.45); border-color: var(--border);
        }
        .btn-secondary:hover:not(:disabled), .btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,.62); }
        .btn-danger { color: #fff; background: linear-gradient(135deg, #e11d48, #fb7185); box-shadow: 0 14px 30px rgba(225,29,72,.18); }

        input, textarea, select {
            width: 100%; border-radius: 18px; border: 1px solid var(--border); background: rgba(255,255,255,.78);
            color: var(--text); padding: 13px 15px; transition: border-color .2s, box-shadow .2s, transform .2s, background .2s;
        }
        html[data-theme="dark"] input, html[data-theme="dark"] textarea, html[data-theme="dark"] select { background: rgba(15, 23, 42, .55); }
        input::placeholder, textarea::placeholder { color: var(--muted-2); }
        input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(99,102,241,.45); box-shadow: 0 0 0 4px rgba(99,102,241,.12); }

        .pill, .auth-chip, .badge, .status-pill, .filter-pill, .score-pill, .soft-pill {
            display: inline-flex; align-items: center; gap: .4rem; border-radius: 999px; border: 1px solid var(--border);
            background: rgba(255,255,255,.56); color: var(--text);
        }
        .pill, .auth-chip, .badge, .filter-pill, .soft-pill { padding: 8px 12px; }

        .nav-link, .sidebar-item {
            border-radius: 16px; transition: background .2s, transform .2s, color .2s, border-color .2s;
        }
        .nav-link:hover, .sidebar-item:hover { background: rgba(99,102,241,.08); transform: translateX(2px); }
        .nav-link.active, .sidebar-item.active { background: linear-gradient(135deg, rgba(79,70,229,.14), rgba(139,92,246,.12)); border-color: rgba(99,102,241,.24); }

        .section-title { letter-spacing: -0.04em; line-height: 1.05; }
        .subtle { color: var(--muted); line-height: 1.65; }
        .hero-chip {
            display: inline-flex; align-items: center; gap: .45rem; padding: 9px 14px; border-radius: 999px;
            background: rgba(255,255,255,.58); border: 1px solid var(--border); color: var(--muted); backdrop-filter: blur(14px);
        }
        .floating { animation: floaty 6s ease-in-out infinite; }
        .skeleton {
            background: linear-gradient(90deg, rgba(148,163,184,.12) 25%, rgba(148,163,184,.22) 37%, rgba(148,163,184,.12) 63%);
            background-size: 400% 100%; animation: shimmer 1.5s infinite; border-radius: 14px;
        }

        .glass-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
        .glass-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,.28); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
        .glass-scrollbar::-webkit-scrollbar-track { background: transparent; }

        .toast { box-shadow: var(--shadow-soft); border: 1px solid var(--border); backdrop-filter: blur(16px); }
        .modal-overlay { background: rgba(15, 23, 42, .42); backdrop-filter: blur(14px); }
        .modal-panel { border-radius: 30px; border: 1px solid var(--border); background: var(--card-strong); box-shadow: var(--shadow); }

        .table-modern { border-collapse: separate; border-spacing: 0; overflow: hidden; }
        .table-modern th { position: sticky; top: 0; background: rgba(248,250,255,.92); backdrop-filter: blur(12px); }
        html[data-theme="dark"] .table-modern th { background: rgba(15,23,42,.9); }
        .table-modern tr:hover td { background: rgba(99,102,241,.05); }

        .proctor-alert, .camera-proctor-toast, .speech-pill { border-radius: 999px; border: 1px solid var(--border); }
      
        .aurora-orb { position: absolute; border-radius: 999px; filter: blur(24px); opacity: .55; pointer-events: none; }
        .premium-card { position: relative; overflow: hidden; border: 1px solid rgba(148,163,184,.18); background: linear-gradient(180deg, rgba(255,255,255,.78), rgba(255,255,255,.58)); box-shadow: var(--shadow); backdrop-filter: blur(20px); }
        html[data-theme="dark"] .premium-card { background: linear-gradient(180deg, rgba(15,23,42,.78), rgba(15,23,42,.56)); }
        .premium-grid { display: grid; gap: 1.25rem; }
        .premium-gradient-text { background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .mega-hero { min-height: 78vh; }
        .sidebar-backdrop { backdrop-filter: blur(18px); }
        .metric-ring { width: 72px; height: 72px; border-radius: 50%; background: conic-gradient(from 0deg, var(--accent), var(--accent2), var(--accent3), var(--accent)); padding: 5px; }
        .metric-ring > span { display: grid; place-items: center; width: 100%; height: 100%; border-radius: 50%; background: var(--card-strong); font-weight: 800; }
        .glass-input { background: rgba(255,255,255,.82); border: 1px solid var(--border); box-shadow: inset 0 1px 0 rgba(255,255,255,.58); }
        html[data-theme="dark"] .glass-input { background: rgba(15,23,42,.6); }
        .soft-shadow { box-shadow: 0 10px 30px rgba(15,23,42,.08); }
        .status-dot-live { box-shadow: 0 0 0 0 rgba(99,102,241,.45); animation: pulseGlow 2s infinite; }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,.42); } 70% { box-shadow: 0 0 0 14px rgba(99,102,241,0); } 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } }

    </style>
        </head>
        <body>
          <div class="header">
            <div style="font-size: 24px; font-weight: 700; color: #6366f1;">${job?.title || 'Interview'}</div>
            <div style="opacity: .8; margin-top: 4px;">${candidate?.name || 'Candidate'} · ${new Date(app.updatedAt).toLocaleDateString()}</div>
            <div style="margin-top: 20px;"><span style="font-size: 28px; font-weight: bold;">${app.interviewScore}%</span> <span style="margin-left:10px;">${t('filter_' + app.status.toLowerCase().replace(' ', '_')) || app.status}</span></div>
          </div>
          <div class="grid">
            <div class="card"><div class="metric">${app.report?.eyeContact || 0}%</div><div>${t('eye_contact')}</div></div>
            <div class="card"><div class="metric">${app.report?.confidence || 0}%</div><div>${t('col_confidence')}</div></div>
            <div class="card"><div class="metric">${app.report?.stress || 0}%</div><div>${t('col_stress')}</div></div>
            <div class="card"><div class="metric">${app.report?.clarity || 0}%</div><div>${t('clarity')}</div></div>
          </div>
          <div class="feedback"><h3>${t('ai_feedback')}</h3><p>${app.report?.feedback}</p></div>
        </body>
        </html>`;
                const blob = new Blob([reportHTML], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'silentinterview-report.html'; a.click(); URL.revokeObjectURL(url); toast(t('msg_report_down'), 'success');
            }

            // ===== CHARTS =====
            function renderCharts() {
                const funnelCanvas = document.getElementById('funnelChart');
                if (funnelCanvas) {
                    const appsData = apps().filter(a => { const job = jobs().find(j => j.id === a.jobId); return job && (job.recruiterId === currentUser().id || job.recruiterId === 'seed'); });
                    const data = { labels: [t('filter_all'), t('filter_shortlisted'), t('filter_rejected'), t('filter_pending')], datasets: [{ label: t('candidates_count'), data: [appsData.length, appsData.filter(a => ['SHORTLISTED', 'QUALIFIED'].includes(a.status)).length, appsData.filter(a => a.status === 'REJECTED').length, appsData.filter(a => a.status === 'PENDING').length], backgroundColor: ['#6366f1', '#8b5cf6', '#fb7185', '#f59e0b'], borderRadius: 16 }] };
                    if (charts.funnel) charts.funnel.destroy(); charts.funnel = new Chart(funnelCanvas, { type: 'bar', data, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: getCss('--muted') }, grid: { display: false } }, y: { ticks: { color: getCss('--muted') }, grid: { color: 'rgba(148,163,184,.12)' } } } } });
                }

                const barCanvas = document.getElementById('barChart');
                if (barCanvas) {
                    const list = apps().filter(a => { const job = jobs().find(j => j.id === a.jobId); return job && (job.recruiterId === currentUser().id || job.recruiterId === 'seed'); });
                    const vals = [avg(list.map(a => a.report?.eyeContact || 0), 82), avg(list.map(a => a.report?.confidence || 0), 74), avg(list.map(a => a.report?.stress || 0), 39), avg(list.map(a => a.report?.clarity || 0), 88)];
                    if (charts.bar) charts.bar.destroy(); charts.bar = new Chart(barCanvas, { type: 'bar', data: { labels: [t('eye_contact'), t('col_confidence'), t('col_stress'), t('clarity')], datasets: [{ label: 'Avg %', data: vals, backgroundColor: ['#6366f1', '#8b5cf6', '#fb7185', '#38bdf8'], borderRadius: 16 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: getCss('--muted') }, grid: { display: false } }, y: { ticks: { color: getCss('--muted') }, grid: { color: 'rgba(148,163,184,.12)' } } } } });
                }

                const pieCanvas = document.getElementById('pieChart');
                if (pieCanvas) {
                    const list = apps().filter(a => { const job = jobs().find(j => j.id === a.jobId); return job && (job.recruiterId === currentUser().id || job.recruiterId === 'seed'); });
                    if (charts.pie) charts.pie.destroy(); charts.pie = new Chart(pieCanvas, { type: 'doughnut', data: { labels: [t('filter_qualified'), t('filter_shortlisted'), t('filter_rejected'), t('filter_pending')], datasets: [{ data: [list.filter(a => a.status === 'QUALIFIED').length, list.filter(a => a.status === 'SHORTLISTED').length, list.filter(a => a.status === 'PENDING').length, list.filter(a => a.status === 'REJECTED').length], backgroundColor: ['#6366f1', '#8b5cf6', '#38bdf8', '#fb7185'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: getCss('--text'), padding: 20, usePointStyle: true } } } } });
                }
            }

            // ===== INIT =====
            seed();

            document.addEventListener('visibilitychange', () => { if (document.hidden && state.interviewDraft) saveInterviewDraft(); });
            window.addEventListener('beforeunload', (e) => { if (state.interviewDraft) { persistDraftSnapshot(); stopSpeechToText({ discardInstance: false, suppressRestart: true }); stopMedia(); e.preventDefault(); e.returnValue = ''; } });

            const saved = load(LS.theme, 'dark');
            setTheme(saved);

            setTimeout(() => {
                const loader = document.getElementById('SilentInterviewLoader');
                if (loader) loader.classList.add('hidden');
                initParticles();
            }, 1500);

            window.render();
        };

        // React render olduqdan sonra skripti işə salırıq
        const startTimeout = setTimeout(() => {
            initApp();
        }, 500);

        return () => {
            clearTimeout(startTimeout);
        };
    }, []);

    return <LegacyMarkup html={`
      <style>
        .auth-shell, .landing-shell, .app-shell { position: relative; }
        /* Refined indigo palette — light mode is the default experience */
        :root {
            --bg0: #f7f8ff;
            --bg1: #eef2ff;
            --bg2: #fdfcff;
            --text: #172033;
            --muted: #64748b;
            --card: rgba(255, 255, 255, 0.82);
            --card2: rgba(248, 250, 255, 0.94);
            --border: rgba(99, 102, 241, 0.14);
            --accent: #5b5bd6;
            --accent2: #8b5cf6;
            --good: #2563eb;
            --warn: #d97706;
            --bad: #e11d48;
            --shadow: 0 18px 48px rgba(73, 82, 149, 0.13);
        }

        html[data-theme="dark"] {
            --bg0: #101426;
            --bg1: #151b35;
            --bg2: #1a2140;
            --text: #f7f8ff;
            --muted: #a9b4cf;
            --card: rgba(24, 31, 59, 0.78);
            --card2: rgba(32, 40, 74, 0.88);
            --border: rgba(199, 210, 254, 0.14);
            --accent: #a5b4fc;
            --accent2: #c4b5fd;
            --good: #93c5fd;
            --warn: #fbbf24;
            --bad: #fb7185;
            --shadow: 0 28px 70px rgba(0, 0, 0, 0.32);
        }

        * {
            box-sizing: border-box;
            cursor: none !important;
        }

        html,
        body {
            min-height: 100%;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            margin: 0;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
            color: var(--text);
            background: var(--bg0);
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
            transition: background 0.3s, color 0.3s;
        }

        /* Mobile Adjustments */
        @media (pointer: coarse), (max-width: 768px) {
            * {
                cursor: auto !important;
            }
            .custom-cursor, .custom-cursor-dot {
                display: none !important;
            }
        }

        /* Arxa Fon Qradiyentləri */
        #heroBg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            pointer-events: none;
            background:
                radial-gradient(circle at 18% 16%, rgba(99, 102, 241, 0.16), transparent 42%),
                radial-gradient(circle at 84% 78%, rgba(168, 85, 247, 0.12), transparent 42%);
            transition: all 0.5s ease;
        }

        .grain::after {
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
            background-image: radial-gradient(rgba(120, 96, 72, 0.06) 1px, transparent 1px);
            background-size: 4px 4px;
            opacity: 0.16;
            mix-blend-mode: soft-light;
            z-index: -1;
        }

        /* Custom Cursor */
        .custom-cursor {
            width: 20px;
            height: 20px;
            border: 2px solid var(--accent);
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s;
            top: -100px;
            left: -100px;
            mix-blend-mode: difference;
        }

        .custom-cursor-dot {
            width: 4px;
            height: 4px;
            background: var(--accent);
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            top: -100px;
            left: -100px;
        }

        .custom-cursor.hover {
            transform: scale(2);
            background: rgba(99, 102, 241, 0.12);
        }

        /* Logo */
        .logo {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1.6rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            transition: all 0.3s;
            letter-spacing: -1px;
        }

        @media (min-width: 640px) {
            .logo { font-size: 1.8rem; }
        }

        .logo:hover {
            animation: glitch 0.3s ease infinite;
            transform: scale(1.05);
        }

        @keyframes glitch {
            0% { transform: translate(0) scale(1.05); }
            20% { transform: translate(-2px, 2px) scale(1.05); }
            40% { transform: translate(-2px, -2px) scale(1.05); }
            60% { transform: translate(2px, 2px) scale(1.05); }
            80% { transform: translate(2px, -2px) scale(1.05); }
            100% { transform: translate(0) scale(1.05); }
        }

        /* Glassmorphism Elements */
        .glass,
        .glass-strong {
            border-radius: 28px;
            border: 1px solid var(--border);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            position: relative;
            overflow: hidden;
            transition: border-color 0.3s, box-shadow 0.3s;
        }

        .glass {
            background: var(--card);
            box-shadow: var(--shadow);
        }

        .glass-strong {
            background: var(--card2);
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
        }

        .glass:hover {
            border-color: rgba(99, 102, 241, 0.28);
            box-shadow: 0 14px 40px rgba(99, 102, 241, 0.15);
        }

        /* Animations */
        .fade-up { animation: fadeUp .42s ease-out; }
        .fade-in { animation: fadeIn .22s ease-out; }

        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px) }
            to { opacity: 1; transform: translateY(0) }
        }

        @keyframes fadeIn {
            from { opacity: 0 }
            to { opacity: 1 }
        }

        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideDownMobile {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }

        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: .55rem;
            border-radius: 20px;
            padding: 12px 18px;
            border: 1px solid transparent;
            font-weight: 700;
            transition: transform .3s ease-out, box-shadow .3s ease-out, background .3s ease-out, border-color .3s ease-out, color .3s ease-out;
            user-select: none;
            text-decoration: none;
            white-space: nowrap;
        }

        .btn:hover:not(:disabled) { transform: translateY(-2px); }
        .btn:active:not(:disabled) { transform: translateY(0); }

        .btn-primary {
            color: #fff;
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
            box-shadow: 0 10px 24px rgba(91, 91, 214, .26);
        }

        .btn-secondary {
            color: var(--text);
            background: var(--card);
            border-color: var(--border);
        }

        .btn-ghost {
            color: var(--text);
            background: transparent;
            border-color: var(--border);
        }

        .btn-danger {
            color: #fff;
            background: linear-gradient(135deg, #e11d48 0%, #fb7185 100%);
            box-shadow: 0 14px 30px rgba(225, 29, 72, .14);
        }

        /* Forms & Inputs */
        .pill, .auth-chip {
            display: inline-flex;
            align-items: center;
            gap: .45rem;
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: .45rem .75rem;
            background: var(--card);
            color: var(--muted);
            font-size: .82rem;
            box-shadow: 0 1px 0 rgba(255, 255, 255, .1) inset;
        }

        .input, .select, .textarea {
            width: 100%;
            border-radius: 20px;
            border: 1px solid var(--border);
            background: var(--card);
            color: var(--text);
            padding: 13px 15px;
            outline: none;
            transition: border-color .3s ease-out, box-shadow .3s ease-out, background .3s ease-out;
            appearance: none;
        }

        .textarea {
            min-height: 110px;
            resize: vertical;
        }

        .input:focus, .select:focus, .textarea:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 4px rgba(99, 102, 241, .14), 0 0 24px rgba(139, 92, 246, .09);
        }

        /* Nav Link */
        .nav-link {
            width: 100%;
            text-align: left;
            border-radius: 16px;
            padding: 13px 15px;
            border: 1px solid transparent;
            background: transparent;
            color: var(--muted);
            transition: .18s ease;
            font-weight: 600;
        }

        .nav-link:hover {
            background: var(--card2);
            color: var(--text);
        }

        .nav-link.active {
            background: linear-gradient(135deg, rgba(99, 102, 241, .14), rgba(139, 92, 246, .09));
            border-color: rgba(99, 102, 241, .20);
            color: var(--text);
        }

        .section-title {
            font-family: 'Space Grotesk', sans-serif;
            letter-spacing: -.04em;
            line-height: 1.1;
        }

        /* Table wrap with responsive scrolling */
        .table-wrap {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            width: 100%;
            scrollbar-width: none;
        }
        .table-wrap::-webkit-scrollbar { display: none; }

        .table-wrap table {
            min-width: 800px;
        }

        .mini-label {
            font-size: 11px;
            letter-spacing: .24em;
            text-transform: uppercase;
            color: var(--muted);
        }

        .dot {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: var(--accent);
            box-shadow: 0 0 0 4px rgba(99, 102, 241, .12);
        }

        .dot.pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .loader {
            border: 2px solid rgba(148, 163, 184, .18);
            border-top-color: var(--accent);
            border-radius: 999px;
            width: 18px;
            height: 18px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .hidden-i { display: none !important; }

        /* Language Switcher */
        .lang-switcher {
            display: flex;
            gap: 0.25rem;
            background: var(--card);
            padding: 0.25rem;
            border-radius: 999px;
            border: 1px solid var(--border);
        }

        .lang-btn {
            padding: 0.4rem 0.8rem;
            border: none;
            background: transparent;
            color: var(--muted);
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 700;
            transition: all 0.3s;
        }

        .lang-btn.active {
            background: var(--accent);
            color: #fff;
            box-shadow: 0 4px 15px rgba(91, 91, 214, 0.28);
        }

        .lang-btn:hover:not(.active) { color: var(--text); }

        /* Full Loader */
        .full-loader {
            position: fixed;
            inset: 0;
            background: var(--bg0);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            transition: opacity 0.5s;
        }

        .full-loader.hidden { opacity: 0; pointer-events: none; }

        .loader-text {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: pulse 1.5s infinite;
            margin-bottom: 1rem;
        }

        @media (min-width: 640px) { .loader-text { font-size: 3rem; } }

        @keyframes loadProgress {
            0% { width: 0; }
            100% { width: 100%; }
        }

        /* Toasts, Modals */
        .toast-container {
            position: fixed;
            top: 24px;
            left: 16px;
            right: 16px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            pointer-events: none;
        }
        @media (min-width: 640px) {
            .toast-container { left: auto; right: 24px; align-items: flex-end; }
            .toast { max-width: 380px; }
        }

        .toast {
            width: 100%;
            pointer-events: all;
            animation: slideDownMobile .3s ease-out;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        @media (min-width: 640px) { .toast { animation: slideIn .3s ease-out; } }

        .toast.success { background: rgba(37, 99, 235, .10); border: 1px solid rgba(37, 99, 235, .22); color: #2563eb; }
        .toast.error { background: rgba(225, 29, 72, .12); border: 1px solid rgba(225, 29, 72, .22); color: #e11d48; }
        .toast.info { background: rgba(217, 119, 6, .12); border: 1px solid rgba(217, 119, 6, .22); color: #d97706; }

        .modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 100;
            background: rgba(10, 10, 15, .8);
            backdrop-filter: blur(18px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            opacity: 0;
            transition: opacity .2s ease;
        }

        .modal-overlay.active { opacity: 1; }
        .modal-content {
            transform: scale(.96);
            transition: transform .2s ease;
            max-height: 90vh;
            overflow-y: auto;
        }
        .modal-overlay.active .modal-content { transform: scale(1); }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, .32); border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--accent); }

        .status-qualified { background: rgba(37, 99, 235, .10); color: #2563eb; border: 1px solid rgba(37, 99, 235, .20); }
        .status-shortlisted { background: rgba(217, 119, 6, .12); color: #d97706; border: 1px solid rgba(217, 119, 6, .20); }
        .status-rejected { background: rgba(225, 29, 72, .12); color: #e11d48; border: 1px solid rgba(225, 29, 72, .20); }
        .status-pending { background: rgba(180, 83, 9, .12); color: #b45309; border: 1px solid rgba(180, 83, 9, .20); }

        .empty-state { text-align: center; padding: 48px 24px; }
        .empty-state-icon {
            width: 64px; height: 64px; margin: 0 auto 16px;
            border-radius: 20px; background: var(--card2);
            display: grid; place-items: center; font-size: 28px;
        }

        .password-wrap { position: relative; }
        .password-toggle {
            position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
            background: none; border: none; color: var(--muted); font-size: 18px; padding: 4px;
        }

        /* Sign-in and sign-up: a clear, product-grade account experience */
        .auth-overlay {
            background: rgba(30, 41, 89, .26);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
        }
        html[data-theme="dark"] .auth-overlay { background: rgba(2, 6, 23, .64); }
        .auth-dialog {
            border-radius: 32px;
            border-color: rgba(99, 102, 241, .18);
            background: var(--card);
            box-shadow: 0 32px 90px rgba(48, 55, 119, .24);
        }
        .auth-layout { display: grid; grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr); }
        .auth-aside {
            position: relative;
            isolation: isolate;
            padding: 48px 44px;
            overflow: hidden;
            background: linear-gradient(145deg, #eef2ff 0%, #faf5ff 55%, #f8fbff 100%);
            border-right: 1px solid var(--border);
        }
        html[data-theme="dark"] .auth-aside { background: linear-gradient(145deg, #1b2344, #171c38 55%, #21183c); }
        .auth-aside::before,
        .auth-aside::after { content: ""; position: absolute; z-index: -1; border-radius: 999px; filter: blur(2px); }
        .auth-aside::before { width: 280px; height: 280px; right: -135px; top: -112px; background: rgba(129, 140, 248, .30); }
        .auth-aside::after { width: 230px; height: 230px; left: -130px; bottom: -125px; background: rgba(192, 132, 252, .22); }
        .auth-kicker { margin: 0 0 10px; color: var(--accent); font-size: 10px; font-weight: 800; letter-spacing: .16em; }
        .auth-aside-title { max-width: 360px; }
        .auth-aside-copy { max-width: 360px; color: var(--muted); }
        .auth-benefits { gap: 10px; margin-top: 28px; }
        .auth-benefit { display: flex; align-items: center; gap: 10px; color: var(--text); font-size: 13px; font-weight: 650; }
        .auth-benefit > span:first-child { display: grid; width: 20px; height: 20px; place-items: center; border-radius: 999px; color: #fff; background: linear-gradient(135deg, var(--accent), var(--accent2)); font-size: 12px; }
        .auth-demo { margin-top: 28px; padding: 18px; border: 1px solid rgba(99, 102, 241, .16); border-radius: 22px; background: rgba(255, 255, 255, .54); box-shadow: inset 0 1px 0 rgba(255,255,255,.60); }
        html[data-theme="dark"] .auth-demo { background: rgba(15, 23, 42, .28); }
        .auth-form-side { padding: 48px 44px; background: rgba(255, 255, 255, .54); }
        html[data-theme="dark"] .auth-form-side { background: rgba(15, 23, 42, .20); }
        .auth-form-heading { margin-bottom: 25px; }
        .auth-form-heading > p:last-child { margin: 8px 0 0; color: var(--muted); font-size: 14px; line-height: 1.55; }
        .auth-mode-switch { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; border: 1px solid var(--border); border-radius: 14px; background: var(--card2); }
        .auth-mode-button { min-height: 42px; border: 0; border-radius: 10px; padding: 8px 12px; color: var(--muted); background: transparent; font-size: 14px; font-weight: 750; transition: color .22s ease, background .22s ease, box-shadow .22s ease; }
        .auth-mode-button:hover { color: var(--text); }
        .auth-mode-button.is-active { color: #fff; background: linear-gradient(135deg, var(--accent), var(--accent2)); box-shadow: 0 5px 15px rgba(91, 91, 214, .24); }
        .auth-field { display: grid; gap: 7px; }
        .auth-field > span { color: var(--text); font-size: 12px; font-weight: 750; }
        .auth-field .input, .auth-field .select { border-radius: 13px; background: var(--bg2); padding: 12px 14px; }
        .auth-field .input::placeholder { color: #94a3b8; }
        .auth-field .password-wrap .input { padding-right: 46px; }
        .auth-error { border: 1px solid rgba(225, 29, 72, .28); border-radius: 13px; padding: 11px 13px; color: #be123c; background: rgba(255, 228, 230, .75); font-size: 13px; line-height: 1.4; }
        html[data-theme="dark"] .auth-error { color: #fecdd3; background: rgba(225, 29, 72, .14); }
        .auth-demo-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .auth-demo-actions .btn { min-height: 42px; border-radius: 13px; padding: 9px; }
        .auth-terms { margin: 15px 0 0; color: var(--muted); font-size: 11px; line-height: 1.55; text-align: center; }
        #closeAuthBtn { width: 38px; height: 38px; border-radius: 12px; padding: 0; color: var(--muted); background: rgba(255,255,255,.78); border-color: var(--border); font-size: 20px; line-height: 1; }
        html[data-theme="dark"] #closeAuthBtn { background: rgba(15, 23, 42, .60); }
        @media (min-width: 768px) { .auth-benefits.hidden { display: grid !important; } .auth-demo.hidden { display: block !important; } }
        @media (max-width: 1023px) { .auth-layout { grid-template-columns: 1fr; } .auth-aside { padding: 30px 32px; border-right: 0; border-bottom: 1px solid var(--border); } .auth-aside-copy { max-width: 680px; } .auth-form-side { padding: 32px; } }
        @media (max-width: 480px) { .auth-aside, .auth-form-side { padding: 24px 20px; } .auth-aside-title { font-size: 29px; } .auth-demo-actions { grid-template-columns: 1fr; } }

        /* The immersive interview view uses the same indigo spectrum, not green. */
        .interview-ambient { background: radial-gradient(circle at 9% 12%, rgba(99,102,241,.20), transparent 29%), radial-gradient(circle at 87% 80%, rgba(168,85,247,.14), transparent 33%), linear-gradient(145deg, #11162d 0%, #171b3a 47%, #11162d 100%); }
        .telemetry-kicker, .telemetry-card-title > strong, .status-ping, .question-meta span:first-child { color: #c4b5fd; }
        .live-orb { border-color: rgba(196,181,253,.32); background: rgba(139,92,246,.12); }
        .live-orb span, .status-ping i, .note-dot { background: #c4b5fd; box-shadow: 0 0 0 4px rgba(196,181,253,.10), 0 0 17px rgba(196,181,253,.72); }
        .telemetry-action:hover { border-color: rgba(196,181,253,.46); background: rgba(139,92,246,.14); box-shadow: 0 0 22px rgba(139,92,246,.18); }
        .telemetry-rail { scrollbar-color: rgba(196,181,253,.32) transparent; }
        .telemetry-scroll::-webkit-scrollbar-thumb { background: rgba(196,181,253,.28); }
        .telemetry-card { background: linear-gradient(145deg, rgba(31,38,76,.84), rgba(12,16,37,.76)); }
        .telemetry-card-title p, .metric-foot span:last-child, .signal-label b, .answer-status b { color: #ddd6fe; }
        .focus-map { background: #121630; }
        .focus-map-grid { background-image: linear-gradient(rgba(196,181,253,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(196,181,253,.10) 1px, transparent 1px); }
        .focus-trace, .signal-fill.valence, .mic-meter i { background: linear-gradient(90deg, #6366f1, #c084fc); box-shadow: 0 0 13px rgba(196,181,253,.65); }
        .focus-trace::after { background: #ede9fe; box-shadow: 0 0 0 4px rgba(196,181,253,.15), 0 0 16px #c4b5fd; }
        .focus-map-label { color: #8b8ac7; }
        .emotion-wave i, .speech-spectrum i { background: linear-gradient(#c4b5fd, #6366f1); }
        .speech-metric-grid b { color: #ddd6fe; }
        .camera-placeholder { background: radial-gradient(circle at 50% 35%, rgba(99,102,241,.20), transparent 30%), linear-gradient(145deg, #171b3a, #11162d); }
        .camera-placeholder-icon { border-color: rgba(196,181,253,.30); color: #c4b5fd; background: rgba(139,92,246,.12); box-shadow: 0 0 35px rgba(99,102,241,.20); }
        .camera-corner { border-color: rgba(196,181,253,.76); }
        .candidate-frame-label { color: rgba(237,233,254,.64); }
        .stage-button.secondary:hover { border-color: rgba(196,181,253,.38); background: rgba(139,92,246,.12); }
        .stage-button.primary { border-color: rgba(196,181,253,.42); background: linear-gradient(135deg, #4f46e5, #7c3aed); box-shadow: 0 0 25px rgba(99,102,241,.24); }
        .stage-button.primary:hover { box-shadow: 0 0 31px rgba(196,181,253,.32); }
        .question-dot.answered { background: #818cf8; box-shadow: 0 0 9px rgba(129,140,248,.54); }
        .question-dot.active { background: #c4b5fd; box-shadow: 0 0 11px rgba(196,181,253,.72); }

        @keyframes confetti-fall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti { position: fixed; width: 10px; height: 10px; top: -10px; z-index: 9999; animation: confetti-fall 3s ease-out forwards; }
        .shimmer { background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .16), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }
        
        /* Immersive AI Telemetry & Analysis Centre */
        .interview-command-center {
            font-family: Inter, ui-sans-serif, system-ui, sans-serif;
            isolation: isolate;
            background: #020617;
        }
        .interview-ambient {
            position: absolute; inset: 0; z-index: -1; pointer-events: none;
            background:
                radial-gradient(circle at 9% 12%, rgba(99,102,241,.20), transparent 29%),
                radial-gradient(circle at 87% 80%, rgba(168,85,247,.14), transparent 33%),
                linear-gradient(145deg, #11162d 0%, #171b3a 47%, #11162d 100%);
        }
        .interview-topbar {
            position: absolute; inset: 0 0 auto; z-index: 3; height: 68px;
            display: flex; align-items: center; justify-content: space-between; gap: 16px;
            padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.06);
            background: rgba(2,6,23,.72); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
        }
        .telemetry-kicker { margin: 0; color: #c4b5fd; font-size: 9px; font-weight: 800; letter-spacing: .16em; }
        .live-orb { width: 30px; height: 30px; display: grid; place-items: center; border: 1px solid rgba(196,181,253,.32); border-radius: 999px; background: rgba(139,92,246,.12); }
        .live-orb span, .status-ping i, .note-dot { display: block; width: 7px; height: 7px; border-radius: 999px; background: #c4b5fd; box-shadow: 0 0 0 4px rgba(196,181,253,.10), 0 0 17px rgba(196,181,253,.72); animation: telemetryPing 1.8s ease-out infinite; }
        .telemetry-chip, .telemetry-action {
            display: inline-flex; align-items: center; gap: 9px; border: 1px solid rgba(255,255,255,.08);
            border-radius: 999px; padding: 9px 13px; color: #f8fafc; font-size: 11px;
            background: rgba(255,255,255,.045); box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
        }
        .telemetry-action { cursor: pointer; transition: .3s ease-out; }
        .telemetry-action:hover { border-color: rgba(196,181,253,.46); background: rgba(139,92,246,.14); box-shadow: 0 0 22px rgba(139,92,246,.18); }
        .interview-grid { display: grid; grid-template-columns: minmax(0,1fr); height: 100%; padding: 80px 12px 12px; gap: 12px; }
        .telemetry-rail {
            min-height: 0; overflow-y: auto; display: grid; align-content: start; gap: 10px;
            padding: 3px 2px 4px; scrollbar-width: thin; scrollbar-color: rgba(196,181,253,.32) transparent;
        }
        .telemetry-scroll::-webkit-scrollbar { width: 3px; }
        .telemetry-scroll::-webkit-scrollbar-thumb { background: rgba(196,181,253,.28); }
        .telemetry-rail-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 2px 3px 4px; }
        .telemetry-rail-head h2 { margin: 3px 0 0; color: #f8fafc; font-size: 16px; font-weight: 750; letter-spacing: -.02em; }
        .status-ping { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; color: #c4b5fd; font-size: 9px; font-weight: 800; letter-spacing: .12em; }
        .status-ping i { width: 5px; height: 5px; }
        .telemetry-card {
            border: 1px solid rgba(255,255,255,.07); border-radius: 20px; padding: 14px;
            background: linear-gradient(145deg, rgba(31,38,76,.84), rgba(12,16,37,.76));
            box-shadow: inset 0 1px 0 rgba(255,255,255,.035), 0 18px 35px rgba(0,0,0,.13);
            backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
        }
        .telemetry-card-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .telemetry-card-title p { margin: 0; color: #ddd6fe; font-size: 10px; font-weight: 800; letter-spacing: .055em; }
        .telemetry-card-title span { display: block; margin-top: 4px; color: #64748b; font-size: 10px; }
        .telemetry-card-title > strong { color: #c4b5fd; font: 700 17px/1 "Space Grotesk", Inter, sans-serif; letter-spacing: -.04em; white-space: nowrap; }
        .focus-map { position: relative; height: 60px; overflow: hidden; margin-top: 14px; border: 1px solid rgba(255,255,255,.055); border-radius: 13px; background: #121630; }
        .focus-map-grid { position: absolute; inset: 0; opacity: .52; background-image: linear-gradient(rgba(196,181,253,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(196,181,253,.10) 1px, transparent 1px); background-size: 20px 15px; mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent); }
        .focus-trace { position: absolute; left: 0; bottom: 21px; height: 2px; width: 0%; min-width: 2px; border-radius: 999px; background: linear-gradient(90deg, #6366f1, #c084fc); box-shadow: 0 0 13px rgba(196,181,253,.65); transition: width .4s cubic-bezier(.16,1,.3,1); }
        .focus-trace::after { content: ""; position: absolute; right: -4px; top: -3px; width: 8px; height: 8px; border-radius: 50%; background: #ede9fe; box-shadow: 0 0 0 4px rgba(196,181,253,.15), 0 0 16px #c4b5fd; }
        .focus-map-label { position: absolute; right: 8px; bottom: 6px; color: #8b8ac7; font: 800 8px/1 Inter, sans-serif; letter-spacing: .14em; }
        .metric-foot { display: flex; justify-content: space-between; margin-top: 9px; color: #64748b; font-size: 10px; }
        .metric-foot span:last-child { color: #ddd6fe; font-weight: 700; }
        .emotion-wave { display: flex; align-items: center; gap: 2px; height: 23px; }
        .emotion-wave i { width: 3px; height: calc(6px + (var(--wave-energy, .2) * 17px)); border-radius: 99px; background: linear-gradient(#c4b5fd, #6366f1); transform-origin: center; animation: emotionWave .85s ease-in-out infinite alternate; }
        .emotion-wave i:nth-child(2n) { animation-delay: -.24s; } .emotion-wave i:nth-child(3n) { animation-delay: -.48s; }
        .signal-row { margin-top: 12px; }
        .signal-label { display: flex; justify-content: space-between; color: #94a3b8; font-size: 10px; }
        .signal-label b { color: #ddd6fe; font-weight: 700; }
        .signal-track, .mic-meter { height: 5px; overflow: hidden; margin-top: 6px; border-radius: 999px; background: rgba(148,163,184,.11); }
        .signal-fill, .mic-meter i { display: block; height: 100%; width: 0; border-radius: inherit; transition: width .38s cubic-bezier(.16,1,.3,1); }
        .signal-fill.valence { background: linear-gradient(90deg, #6366f1, #c084fc); box-shadow: 0 0 10px rgba(196,181,253,.58); }
        .signal-fill.stress { background: linear-gradient(90deg, #fda4af, #fb7185); box-shadow: 0 0 10px rgba(251,113,133,.44); }
        .speech-spectrum { display: flex; align-items: end; gap: 3px; height: 38px; margin: 15px 0 0; }
        .speech-spectrum i { width: 100%; min-height: 4px; height: calc(5px + (var(--signal-strength, .05) * 31px)); border-radius: 99px; background: linear-gradient(180deg, #c4b5fd, #6366f1); opacity: .35; transform-origin: bottom; animation: spectrumPulse .9s ease-in-out infinite alternate; }
        .speech-spectrum i:nth-child(2n) { animation-delay: -.3s; } .speech-spectrum i:nth-child(3n) { animation-delay: -.58s; } .speech-spectrum i:nth-child(5n) { animation-delay: -.18s; }
        .mic-meter i { background: linear-gradient(90deg, #6366f1, #c084fc); box-shadow: 0 0 12px rgba(196,181,253,.55); }
        .speech-metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 13px; }
        .speech-metric-grid > div { border: 1px solid rgba(255,255,255,.055); border-radius: 12px; padding: 9px; background: rgba(255,255,255,.022); }
        .speech-metric-grid span { display: block; color: #64748b; font-size: 8px; font-weight: 800; letter-spacing: .13em; }
        .speech-metric-grid b { display: block; overflow: hidden; margin-top: 5px; color: #ddd6fe; font-size: 11px; white-space: nowrap; text-overflow: ellipsis; }
        .telemetry-note { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; }
        .telemetry-note .note-dot { width: 6px; height: 6px; flex: 0 0 auto; margin-top: 5px; }
        .telemetry-note p { margin: 0; color: #94a3b8; font-size: 10px; line-height: 1.5; }
        .candidate-stage { position: relative; min-height: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.09); border-radius: 24px; background: #050b11; box-shadow: 0 28px 80px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.04); }
        .candidate-camera { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); filter: contrast(1.04) saturate(.91) brightness(.88); }
        .camera-placeholder { position: absolute; inset: 0; z-index: 1; display: grid; align-content: center; justify-items: center; padding: 28px; text-align: center; background: radial-gradient(circle at 50% 35%, rgba(99,102,241,.20), transparent 30%), linear-gradient(145deg, #171b3a, #11162d); }
        .camera-placeholder-icon { display: grid; width: 58px; height: 58px; margin-bottom: 15px; place-items: center; border: 1px solid rgba(196,181,253,.30); border-radius: 20px; color: #c4b5fd; font-size: 27px; background: rgba(139,92,246,.12); box-shadow: 0 0 35px rgba(99,102,241,.20); }
        .camera-placeholder h3 { max-width: 380px; margin: 0; color: #f8fafc; font-size: 16px; } .camera-placeholder p { margin: 8px 0 0; color: #94a3b8; font-size: 12px; }
        .camera-vignette { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(180deg, rgba(2,6,23,.55), transparent 30%, rgba(2,6,23,.16) 55%, rgba(2,6,23,.90)); }
        .camera-corner { position: absolute; z-index: 2; width: 25px; height: 25px; border-color: rgba(196,181,253,.76); opacity: .72; }
        .camera-corner.top-left { top: 18px; left: 18px; border-top: 1px solid; border-left: 1px solid; border-radius: 6px 0 0; } .camera-corner.top-right { top: 18px; right: 18px; border-top: 1px solid; border-right: 1px solid; border-radius: 0 6px 0 0; } .camera-corner.bottom-left { bottom: 18px; left: 18px; border-bottom: 1px solid; border-left: 1px solid; border-radius: 0 0 0 6px; } .camera-corner.bottom-right { right: 18px; bottom: 18px; border-right: 1px solid; border-bottom: 1px solid; border-radius: 0 0 6px; }
        .candidate-frame-meta { position: absolute; z-index: 2; top: 18px; right: 18px; display: flex; align-items: center; gap: 10px; }
        .candidate-frame-label { color: rgba(237,233,254,.64); font-size: 8px; font-weight: 800; letter-spacing: .14em; }
        .question-workspace { position: absolute; z-index: 3; right: 0; bottom: 0; left: 0; padding: 18px; }
        .question-glass { padding: 15px 16px; border: 1px solid rgba(255,255,255,.11); border-radius: 19px; background: rgba(2,6,23,.70); box-shadow: 0 16px 48px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.04); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .question-meta, .answer-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #94a3b8; font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
        .question-meta span:first-child { color: #c4b5fd; } .question-meta b { color: #f8fafc; }
        .question-glass h1 { max-width: 950px; margin: 11px 0 0; color: #f8fafc; font-size: clamp(18px, 2.1vw, 31px); font-weight: 750; line-height: 1.22; letter-spacing: -.035em; text-wrap: balance; }
        .answer-shell { position: relative; overflow: hidden; margin-top: 10px; padding: 1px; border-radius: 18px; background: linear-gradient(105deg, var(--answer-accent) 0 var(--answer-progress), rgba(255,255,255,.11) var(--answer-progress) 100%); box-shadow: 0 10px 34px rgba(0,0,0,.2); transition: background .3s ease-out, box-shadow .3s ease-out; }
        .star-answer { display: block; width: 100%; min-height: 101px; resize: vertical; border: 0; outline: 0; border-radius: 17px; padding: 16px 16px 35px; color: #f8fafc; font: 500 14px/1.55 Inter, sans-serif; background: rgba(14,18,43,.83); transition: box-shadow .3s ease-out, background .3s ease-out; backdrop-filter: blur(18px); }
        .star-answer::placeholder { color: #64748b; } .star-answer:focus { background: rgba(19,25,57,.92); }
        .answer-status { position: absolute; right: 15px; bottom: 12px; left: 15px; pointer-events: none; color: #64748b; } .answer-status b { color: #ddd6fe; }
        .question-controls { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; margin-top: 11px; }
        .stage-button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 37px; border: 1px solid rgba(255,255,255,.10); border-radius: 999px; padding: 8px 13px; color: #f8fafc; font-size: 11px; font-weight: 750; cursor: pointer; transition: transform .3s ease-out, border-color .3s ease-out, background .3s ease-out, box-shadow .3s ease-out; }
        .stage-button:hover { transform: translateY(-1px); } .stage-button:disabled { cursor: not-allowed; opacity: .32; transform: none; }
        .stage-button.secondary { background: rgba(255,255,255,.045); } .stage-button.secondary:hover { border-color: rgba(196,181,253,.38); background: rgba(139,92,246,.12); }
        .stage-button.primary { border-color: rgba(196,181,253,.42); background: linear-gradient(135deg, #4f46e5, #7c3aed); box-shadow: 0 0 25px rgba(99,102,241,.24); } .stage-button.primary:hover { box-shadow: 0 0 31px rgba(196,181,253,.32); }
        .question-dots { display: flex; justify-content: center; align-items: center; gap: 6px; min-width: 0; }
        .question-dot { width: 6px; height: 6px; border-radius: 999px; background: rgba(255,255,255,.20); transition: .3s ease-out; }
        .question-dot.answered { background: #818cf8; box-shadow: 0 0 9px rgba(129,140,248,.54); } .question-dot.active { width: 18px; background: #c4b5fd; box-shadow: 0 0 11px rgba(196,181,253,.72); }
        @keyframes telemetryPing { 50% { transform: scale(.8); opacity: .58; } }
        @keyframes emotionWave { from { transform: scaleY(.48); opacity: .42; } to { transform: scaleY(1); opacity: .96; } }
        @keyframes spectrumPulse { from { transform: scaleY(.3); opacity: .24; } to { transform: scaleY(1); opacity: .9; } }
        @media (min-width: 1024px) {
            .interview-topbar { height: 76px; padding: 14px 24px; } .interview-grid { grid-template-columns: minmax(290px, .67fr) minmax(0, 1.5fr); gap: 16px; padding: 92px 18px 18px; }
            .telemetry-rail { padding-right: 5px; } .candidate-stage { border-radius: 28px; } .question-workspace { padding: 24px; } .question-glass { padding: 19px 21px; } .star-answer { padding: 18px 19px 39px; font-size: 15px; } .question-controls { margin-top: 13px; }
        }
        @media (max-width: 1023px) {
            .interview-grid { grid-template-rows: minmax(217px, .74fr) minmax(0, 1.26fr); } .telemetry-rail { grid-template-columns: repeat(3, minmax(220px,1fr)); grid-template-rows: auto auto; overflow-x: auto; overflow-y: hidden; padding-bottom: 6px; }
            .telemetry-rail-head { grid-column: 1 / -1; } .telemetry-note { display: none; }
        }
        @media (max-width: 640px) {
            .interview-topbar { height: 62px; padding: 9px 12px; } .interview-grid { padding: 70px 8px 8px; gap: 8px; } .telemetry-rail { gap: 8px; grid-template-columns: repeat(3, minmax(205px,1fr)); } .telemetry-card { border-radius: 16px; padding: 11px; } .telemetry-rail-head h2 { font-size: 14px; }
            .candidate-stage { border-radius: 18px; } .camera-corner { width: 17px; height: 17px; } .camera-corner.top-left { top: 10px; left: 10px; } .camera-corner.top-right { top: 10px; right: 10px; } .camera-corner.bottom-left { bottom: 10px; left: 10px; } .camera-corner.bottom-right { right: 10px; bottom: 10px; } .candidate-frame-meta { top: 11px; right: 11px; } .candidate-frame-label { display: none; }
            .question-workspace { padding: 10px; } .question-glass { padding: 12px; border-radius: 15px; } .question-glass h1 { margin-top: 8px; font-size: 17px; } .answer-shell { border-radius: 15px; } .star-answer { min-height: 80px; border-radius: 14px; padding: 12px 12px 31px; font-size: 13px; } .answer-status { right: 12px; bottom: 9px; left: 12px; font-size: 8px; }
            .stage-button { min-height: 34px; padding: 7px 10px; font-size: 10px; } .stage-button span { display: none; } .question-dots { gap: 4px; } .question-dot { width: 5px; height: 5px; } .question-dot.active { width: 13px; }
        }
        /* Split-screen proctoring interview: clean camera left, controls right. */
        .interview-command-center { background: #090e1e; }
        .interview-command-center::before { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .48; background: radial-gradient(circle at 8% 13%, rgba(99,102,241,.18), transparent 24%), radial-gradient(circle at 91% 83%, rgba(168,85,247,.14), transparent 29%), repeating-linear-gradient(90deg, transparent 0 63px, rgba(196,181,253,.035) 64px), repeating-linear-gradient(0deg, transparent 0 63px, rgba(196,181,253,.035) 64px); }
        .interview-topbar { position: relative; z-index: 2; }
        .interview-grid { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 7fr) minmax(350px, 3fr); gap: 18px; height: calc(100dvh - 76px); padding: 18px; }
        .candidate-stage { order: -1; min-height: 0; height: auto; border-color: rgba(196,181,253,.20); border-radius: 28px; background: #050812; box-shadow: 0 28px 80px rgba(0,0,0,.38); transition: border-color .28s ease, box-shadow .28s ease; }
        .candidate-stage.proctor-warning { border-color: rgba(251,191,36,.86); box-shadow: 0 0 0 1px rgba(251,191,36,.32), 0 0 38px rgba(245,158,11,.16), 0 28px 80px rgba(0,0,0,.38); }.candidate-stage.proctor-review_required { border-color: rgba(251,113,133,.88); box-shadow: 0 0 0 1px rgba(251,113,133,.34), 0 0 42px rgba(225,29,72,.17), 0 28px 80px rgba(0,0,0,.38); }
        .candidate-camera { filter: contrast(1.04) saturate(.9) brightness(.95); }
        .telemetry-rail { display: flex; flex-direction: column; gap: 12px; min-height: 0; overflow-y: auto; padding: 20px; border: 1px solid rgba(196,181,253,.15); border-radius: 28px; background: linear-gradient(145deg, rgba(24,30,57,.97), rgba(11,16,34,.98)); box-shadow: 0 28px 75px rgba(0,0,0,.25); }
        .telemetry-rail-head { flex: 0 0 auto; }.telemetry-rail-head h2 { font-size: 17px; }
        .camera-health-card, .proctor-card { flex: 0 0 auto; }.camera-health-copy { margin: 12px 0 0; color: #a5b0ce; font-size: 11px; line-height: 1.5; }
        .proctor-alert { margin-top: 12px; padding: 11px 12px; border: 1px solid rgba(110,231,183,.22); border-radius: 12px; color: #c9f8df; background: rgba(16,185,129,.08); font-size: 11px; font-weight: 650; line-height: 1.45; }
        .proctor-alert.warning { border-color: rgba(251,191,36,.36); color: #ffe7ad; background: rgba(245,158,11,.10); }.proctor-alert.review_required { border-color: rgba(251,113,133,.38); color: #fecdd3; background: rgba(225,29,72,.11); }
        .camera-proctor-toast { position: absolute; z-index: 5; top: 50%; left: 50%; width: min(480px, calc(100% - 42px)); padding: 14px 17px; border: 1px solid rgba(251,191,36,.56); border-radius: 15px; color: #fff7e7; background: rgba(64,44,15,.88); box-shadow: 0 20px 55px rgba(0,0,0,.42); backdrop-filter: blur(16px); font-size: 13px; font-weight: 700; line-height: 1.45; text-align: center; transform: translate(-50%, -50%); animation: proctor-toast-in .24s ease-out; }.camera-proctor-toast.review_required { border-color: rgba(251,113,133,.58); background: rgba(79,27,35,.90); }.camera-proctor-toast.hidden-i { display: none; }
        .side-question-workspace { display: flex; flex: 1 0 auto; flex-direction: column; gap: 10px; min-height: 318px; padding-top: 4px; }.side-question-workspace .question-glass { padding: 0; border: 0; border-radius: 0; background: transparent; }.side-question-workspace .question-glass h1 { max-width: none; font-size: clamp(18px, 1.45vw, 24px); }.side-question-workspace .answer-shell { flex: 1; display: flex; min-height: 125px; }.side-question-workspace .star-answer { min-height: 100%; resize: none; }.side-question-workspace .question-controls { margin-top: 3px; }
        .text-shadow-lg { text-shadow: 0 4px 15px rgba(0,0,0,0.6); }
        @keyframes proctor-toast-in { from { opacity: 0; transform: translate(-50%, -45%) scale(.97); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @media (max-width: 1023px) { .interview-grid { grid-template-columns: 1fr; height: auto; min-height: calc(100dvh - 76px); }.candidate-stage { order: 0; min-height: min(58vw, 430px); }.telemetry-rail { overflow: visible; }.side-question-workspace { min-height: 280px; } }
        @media (max-width: 640px) { .interview-grid { gap: 8px; padding: 70px 8px 8px; }.telemetry-rail, .candidate-stage { border-radius: 18px; }.telemetry-rail { padding: 14px; }.telemetry-rail-head { display: flex; }.side-question-workspace .question-glass h1 { font-size: 18px; }.side-question-workspace { min-height: 240px; } }
      
        .aurora-orb { position: absolute; border-radius: 999px; filter: blur(24px); opacity: .55; pointer-events: none; }
        .premium-card { position: relative; overflow: hidden; border: 1px solid rgba(148,163,184,.18); background: linear-gradient(180deg, rgba(255,255,255,.78), rgba(255,255,255,.58)); box-shadow: var(--shadow); backdrop-filter: blur(20px); }
        html[data-theme="dark"] .premium-card { background: linear-gradient(180deg, rgba(15,23,42,.78), rgba(15,23,42,.56)); }
        .premium-grid { display: grid; gap: 1.25rem; }
        .premium-gradient-text { background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .mega-hero { min-height: 78vh; }
        .sidebar-backdrop { backdrop-filter: blur(18px); }
        .metric-ring { width: 72px; height: 72px; border-radius: 50%; background: conic-gradient(from 0deg, var(--accent), var(--accent2), var(--accent3), var(--accent)); padding: 5px; }
        .metric-ring > span { display: grid; place-items: center; width: 100%; height: 100%; border-radius: 50%; background: var(--card-strong); font-weight: 800; }
        .glass-input { background: rgba(255,255,255,.82); border: 1px solid var(--border); box-shadow: inset 0 1px 0 rgba(255,255,255,.58); }
        html[data-theme="dark"] .glass-input { background: rgba(15,23,42,.6); }
        .soft-shadow { box-shadow: 0 10px 30px rgba(15,23,42,.08); }
        .status-dot-live { box-shadow: 0 0 0 0 rgba(99,102,241,.45); animation: pulseGlow 2s infinite; }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,.42); } 70% { box-shadow: 0 0 0 14px rgba(99,102,241,0); } 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } }

    </style>

      <div class="full-loader" id="SilentInterviewLoader">
          <div class="text-center">
              <div class="loader-text">SilentInterview</div>
              <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; margin: 0 auto;">
                  <div style="height: 100%; background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%); width: 0; animation: loadProgress 1.5s ease forwards;"></div>
              </div>
          </div>
      </div>

      <div class="custom-cursor"></div>
      <div class="custom-cursor-dot"></div>

      <div id="heroBg"></div>

      <canvas id="particle-canvas" style="position: fixed; inset: 0; pointer-events: none; z-index: -1;"></canvas>

      <div id="app"></div>
      <div id="toastContainer" class="toast-container"></div>

      <div id="demoModal" class="modal-overlay hidden-i">
          <div class="glass rounded-[34px] w-full max-w-lg p-6 sm:p-8 modal-content">
              <div class="flex items-center justify-between mb-6">
                  <h2 class="text-2xl font-black font-space" data-key="demo_title">Demo Bron Et</h2>
                  <button onclick="closeDemoModal()" class="btn btn-secondary px-3 py-2">✕</button>
              </div>
              <form id="demoForm" class="space-y-4">
                  <input class="input" name="name" placeholder="Full name" required>
                  <input class="input" name="email" type="email" placeholder="Work email" required>
                  <input class="input" name="company" placeholder="Company name" required>
                  <select class="select" name="teamSize" required>
                      <option value="">Team size</option>
                      <option>1-10</option>
                      <option>11-50</option>
                      <option>51-200</option>
                      <option>200+</option>
                  </select>
                  <textarea class="textarea" name="message" placeholder="What are you looking to solve? (optional)"></textarea>
                  <button type="submit" class="btn btn-primary w-full">
                      <span id="demoBtnText" data-key="schedule_demo">Schedule Demo</span>
                      <span id="demoBtnLoader" class="loader hidden-i"></span>
                  </button>
              </form>
          </div>
      </div>

      <div id="confirmModal" class="modal-overlay hidden-i">
          <div class="glass rounded-[34px] w-full max-w-md p-6 sm:p-8 modal-content text-center">
              <div class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl" style="background: rgba(251,113,133,.12);">
                  <span style="font-size: 28px;">⚠</span>
              </div>
              <h2 id="confirmTitle" class="text-xl font-black mb-2">Are you sure?</h2>
              <p id="confirmMessage" class="text-sm mb-6" style="color: var(--muted);">This action cannot be undone.</p>
              <div class="flex gap-3 justify-center flex-wrap">
                  <button onclick="closeConfirmModal()" class="btn btn-secondary flex-1" id="btnCancelConfirm">Cancel</button>
                  <button id="confirmActionBtn" class="btn btn-danger flex-1">Confirm</button>
              </div>
          </div>
      </div>

      <template id="tpl-landing">
          <div>
              <header class="sticky top-0 z-50 border-b transition-all duration-300" style="border-color: var(--border); background: var(--card); backdrop-filter: blur(20px);">
                  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                      <div class="flex h-20 items-center justify-between gap-4 py-4">
                          <div class="flex items-center gap-3">
                              <div class="logo">SilentInterview</div>
                          </div>
                          <div class="hidden md:flex items-center gap-3">
                              <div class="lang-switcher mr-2">
                                  <button class="lang-btn active" onclick="changeLang('az')">AZ</button>
                                  <button class="lang-btn" onclick="changeLang('en')">EN</button>
                                  <button class="lang-btn" onclick="changeLang('ru')">RU</button>
                              </div>
                              <button
                                    class="btn btn-primary"
                                    onclick="window.location.href='/auth'">
                                    Panelə daxil ol
                                </button>
                              <button class="btn btn-secondary" onclick="toggleTheme()" title="Theme">🌓</button>
                          </div>
                          <div class="flex items-center md:hidden gap-2">
                              <button class="btn btn-secondary px-3 py-2" onclick="toggleTheme()" title="Theme">🌓</button>
                              <button id="mobileOpenBtn" class="btn btn-secondary px-3 py-2">☰</button>
                          </div>
                      </div>
                  </div>
                  <div id="mobileMenu" class="hidden md:hidden px-4 pb-4">
                      <div class="glass rounded-3xl p-4 grid gap-3">
                          <div class="lang-switcher mx-auto w-max mb-1">
                              <button class="lang-btn active" onclick="changeLang('az')">AZ</button>
                              <button class="lang-btn" onclick="changeLang('en')">EN</button>
                              <button class="lang-btn" onclick="changeLang('ru')">RU</button>
                          </div>
                          <button class="btn btn-secondary w-full" data-open-auth="login" data-key="login">Daxil ol</button>
                          <button class="btn btn-primary w-full" data-open-auth="signup" data-key="signup">Qeydiyyat</button>
                          <button class="btn btn-ghost w-full" onclick="openDemoModal()" data-key="book_demo">Demo Bron Et</button>
                      </div>
                  </div>
              </header>

              <section class="relative overflow-hidden min-h-[85vh] flex items-center">
                  <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 w-full text-center">
                      <div class="fade-up flex flex-col items-center">
                          <div class="flex flex-wrap gap-2 justify-center mb-6">
                              <span class="pill"><span class="dot pulse"></span><span data-key="trusted_workflow">Etibarlı işə qəbul prosesi</span></span>
                              <span class="pill" data-key="candidate_first">Namizəd mərkəzli UX</span>
                          </div>
                          <h1 class="section-title mt-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black max-w-4xl mx-auto"
                              style="text-shadow: 0 0 30px rgba(217, 119, 6, 0.2);" data-key="hero_title">
                              Daha ağıllı <br>
                              <span style="background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; background-clip: text; color: transparent;">hazırlıq.</span>
                          </h1>
                          <p class="mt-6 max-w-2xl mx-auto text-base sm:text-lg leading-7 sm:leading-8" style="color: var(--muted);" data-key="hero_desc">
                              Namizədlər və rekruterlər üçün təkmilləşdirilmiş AI müsahibə mühiti — daha sakit, daha aydın və daha yaxşı qərarlar üçün yaradılıb. SilentInterview Versiyası.
                          </p>
                          <div class="mt-8 flex flex-wrap justify-center gap-3">
                              <button class="btn btn-primary" data-open-auth="signup" data-key="start_interview">Müsahibəyə Başla</button>
                              <button class="btn btn-secondary" onclick="openDemoModal()" data-key="book_demo">Demo Bron Et</button>
                          </div>
                      </div>
                  </div>
              </section>

              <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                  <div class="grid gap-6 lg:grid-cols-2">
                      <div class="glass rounded-[30px] p-6 hover:-translate-y-1 transition-transform duration-300">
                          <p class="mini-label">Workflow</p>
                          <h2 class="mt-3 text-2xl sm:text-3xl font-black section-title" data-key="workflow_candidates">Namizədlər üçün</h2>
                          <div class="mt-5 grid gap-3 text-sm" style="color: var(--muted);">
                              <div class="glass-strong rounded-2xl p-4 flex items-center gap-3">
                                  <div class="h-8 w-8 rounded-xl shrink-0 grid place-items-center text-sm font-bold" style="background: rgba(217,119,6,.12); color: var(--accent);">1</div>
                                  <span data-key="wf_c1">Vakansiya seçin və tələbləri nəzərdən keçirin</span>
                              </div>
                              <div class="glass-strong rounded-2xl p-4 flex items-center gap-3">
                                  <div class="h-8 w-8 rounded-xl shrink-0 grid place-items-center text-sm font-bold" style="background: rgba(217,119,6,.12); color: var(--accent);">2</div>
                                  <span data-key="wf_c2">AI dəstəkli video müsahibəni tamamlayın</span>
                              </div>
                              <div class="glass-strong rounded-2xl p-4 flex items-center gap-3">
                                  <div class="h-8 w-8 rounded-xl shrink-0 grid place-items-center text-sm font-bold" style="background: rgba(217,119,6,.12); color: var(--accent);">3</div>
                                  <span data-key="wf_c3">Ətraflı performans hesabatı əldə edin</span>
                              </div>
                          </div>
                      </div>
                      <div class="glass rounded-[30px] p-6 hover:-translate-y-1 transition-transform duration-300">
                          <p class="mini-label">Workflow</p>
                          <h2 class="mt-3 text-2xl sm:text-3xl font-black section-title" data-key="workflow_recruiters">Rekruterlər üçün</h2>
                          <div class="mt-5 grid gap-3 text-sm" style="color: var(--muted);">
                              <div class="glass-strong rounded-2xl p-4 flex items-center gap-3">
                                  <div class="h-8 w-8 rounded-xl shrink-0 grid place-items-center text-sm font-bold" style="background: rgba(124,58,237,.12); color: var(--accent2);">1</div>
                                  <span data-key="wf_r1">Vakansiya yaradın və AI parametrlərini təyin edin</span>
                              </div>
                              <div class="glass-strong rounded-2xl p-4 flex items-center gap-3">
                                  <div class="h-8 w-8 rounded-xl shrink-0 grid place-items-center text-sm font-bold" style="background: rgba(124,58,237,.12); color: var(--accent2);">2</div>
                                  <span data-key="wf_r2">AI-ni şirkət mədəniyyəti üzrə öyrədin</span>
                              </div>
                              <div class="glass-strong rounded-2xl p-4 flex items-center gap-3">
                                  <div class="h-8 w-8 rounded-xl shrink-0 grid place-items-center text-sm font-bold" style="background: rgba(124,58,237,.12); color: var(--accent2);">3</div>
                                  <span data-key="wf_r3">Sıralanmış namizəd siyahılarını əldə edin</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>

              <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                  <div class="flex items-end justify-between gap-4 flex-wrap">
                      <div>
                          <p class="mini-label" data-key="product_highlights">Product Highlights</p>
                          <h2 class="mt-3 text-3xl sm:text-4xl font-black section-title" data-key="story_title">Mükəmməl məhsul hekayəsi.</h2>
                      </div>
                  </div>
                  <div id="featureGrid" class="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"></div>
              </section>

              <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                  <div class="glass rounded-[30px] p-6">
                      <p class="mini-label" data-key="plans">Plans</p>
                      <div id="pricingGrid" class="mt-4 grid gap-4 md:grid-cols-3"></div>
                  </div>
              </section>

              <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                  <div class="glass rounded-[30px] p-6">
                      <p class="mini-label" data-key="client_notes">Client Notes</p>
                      <div id="testimonialsGrid" class="mt-4 grid gap-4 md:grid-cols-3"></div>
                  </div>
              </section>

              <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                  <div class="glass rounded-[30px] p-8 text-center">
                      <h2 class="text-3xl font-black mb-4" data-key="ready_to_modernize">İşə qəbulu müasirləşdirməyə hazırsınız?</h2>
                      <p class="text-base sm:text-lg mb-6 max-w-2xl mx-auto" style="color: var(--muted);" data-key="ready_desc">Sakit müsahibələr, dəqiq qiymətləndirmələr və daha yaxşı namizəd təcrübəsi yaratmaq üçün SilentInterview istifadə edən komandalara qoşulun.</p>
                      <div class="flex flex-wrap gap-3 justify-center">
                          <button class="btn btn-primary w-full sm:w-auto" data-open-auth="signup" data-key="get_started_free">Pulsuz Başla</button>
                          <button class="btn btn-secondary w-full sm:w-auto" onclick="openDemoModal()" data-key="book_demo">Demo Bron Et</button>
                      </div>
                  </div>
              </section>

              <footer class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                  <div class="flex flex-col gap-6 border-t pt-8" style="border-color: var(--border);">
                      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div class="flex items-center gap-3">
                              <div class="logo" style="font-size: 1.4rem;">SilentInterview</div>
                          </div>
                          <div class="flex flex-wrap gap-4 text-sm" style="color: var(--muted);">
                              <a href="#" class="hover:text-[var(--text)] transition-colors">Privacy</a>
                              <a href="#" class="hover:text-[var(--text)] transition-colors">Terms</a>
                              <a href="#" class="hover:text-[var(--text)] transition-colors">Support</a>
                              <a href="#" class="hover:text-[var(--text)] transition-colors">Contact</a>
                          </div>
                      </div>
                      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm" style="color: var(--muted);">
                          <p>© <span id="year"></span> SilentInterview Team. All rights reserved.</p>
                          <p data-key="footer_desc">Namizədlər və rekruterlər üçün təkmilləşdirilmiş işə qəbul platforması</p>
                      </div>
                  </div>
              </footer>
          </div>
      </template>

      <template id="tpl-auth">
          <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 auth-overlay">
              <div class="glass w-full max-w-6xl p-0 fade-in relative overflow-y-auto max-h-[95vh] auth-dialog premium-card">
                  <button id="closeAuthBtn" class="btn btn-secondary absolute right-3 top-3 sm:right-4 sm:top-4 px-3 py-2 z-10 soft-shadow">✕</button>
                  <div class="auth-layout premium-grid">
                      <aside class="auth-aside premium-card">
                          <div class="logo mb-4" style="font-size: 1.4rem;">SilentInterview</div>
                          <p class="auth-kicker">SECURE WORKSPACE</p>
                          <h2 class="section-title text-3xl sm:text-4xl font-black auth-aside-title" id="authTitle" data-key="login">Daxil ol</h2>
                          <p class="mt-4 leading-7 text-sm sm:text-base auth-aside-copy" data-key="auth_subtitle">
                              A premium, conversion-friendly workspace for HR teams and candidates — simple to start, trustworthy to use.
                          </p>
                          <div class="auth-benefits hidden md:grid">
                              <div class="auth-benefit"><span>✓</span><span data-key="feat_1">Role-based access</span></div>
                              <div class="auth-benefit"><span>✓</span><span data-key="feat_2">Local account storage</span></div>
                              <div class="auth-benefit"><span>✓</span><span data-key="feat_3">Automatic dashboard redirect</span></div>
                          </div>
                          <div class="auth-demo hidden md:block">
                              <div class="text-sm font-semibold" data-key="demo_accounts">Demo accounts</div>
                              <div class="mt-3 grid gap-2 text-sm" style="color: var(--muted);">
                                  <div class="flex items-center gap-2 flex-wrap">
                                      <span class="pill" style="font-size: 11px;">RECRUITER</span>
                                      <span class="font-semibold break-all">hr@silentinterview.com</span>
                                  </div>
                                  <div class="flex items-center gap-2 flex-wrap mt-1">
                                      <span class="pill" style="font-size: 11px;">CANDIDATE</span>
                                      <span class="font-semibold break-all">candidate@silentinterview.com</span>
                                  </div>
                              </div>
                          </div>
                      </aside>

                      <section class="auth-form-side premium-card">
                          <div class="auth-form-heading premium-grid">
                              <p class="auth-kicker">ACCOUNT ACCESS</p>
                              <h3 class="section-title text-3xl font-black" id="authFormTitle" data-key="login">Daxil ol</h3>
                              <p>Use your details to continue to your workspace.</p>
                          </div>
                          <div class="auth-mode-switch">
                              <button class="auth-mode-button premium-card" id="tabLogin" data-key="login">Daxil ol</button>
                              <button class="auth-mode-button premium-card" id="tabSignup" data-key="signup">Qeydiyyat</button>
                          </div>

                          <form id="authForm" class="mt-5 space-y-4">
                              <label id="authNameField" class="auth-field hidden-i">
                                  <span>Full name</span>
                                  <input id="authName" class="input" placeholder="Your full name" autocomplete="name" />
                              </label>
                              <label class="auth-field">
                                  <span>Email address</span>
                                  <input id="authEmail" class="input" type="email" placeholder="name@company.com" autocomplete="email" />
                              </label>
                              <label class="auth-field">
                                  <span>Password</span>
                              <div class="password-wrap">
                                  <input id="authPassword" class="input" type="password" placeholder="Enter your password" autocomplete="current-password" />
                                  <button type="button" class="password-toggle" onclick="togglePasswordVisibility()">👁</button>
                              </div>
                              </label>
                              <label id="authRoleField" class="auth-field hidden-i">
                                  <span>Account type</span>
                              <select id="authRole" class="select">
                                  <option value="RECRUITER">Recruiter / HR</option>
                                  <option value="CANDIDATE">Candidate</option>
                              </select>
                              </label>
                              <label id="authCompanyField" class="auth-field hidden-i">
                                  <span>Company name</span>
                                  <input id="authCompany" class="input" placeholder="Your company" autocomplete="organization" />
                              </label>
                              <div id="authError" class="auth-error hidden-i"></div>
                              
                              <div class="auth-demo-actions">
                                  <button type="button" onclick="fillDemoAccount('RECRUITER')" class="btn btn-secondary text-xs p-2" data-key="fill_hr">Fill HR Demo</button>
                                  <button type="button" onclick="fillDemoAccount('CANDIDATE')" class="btn btn-secondary text-xs p-2" data-key="fill_user">Fill User Demo</button>
                              </div>

                              <button class="btn btn-primary w-full" id="authSubmit" type="submit">
                                  <span id="authBtnText">Continue</span>
                                  <span id="authBtnLoader" class="loader hidden-i"></span>
                              </button>
                          </form>
                          <p class="auth-terms" data-key="terms">
                              By signing up, you agree to our Terms. Auto-redirect enabled.
                          </p>
                      </section>
                  </div>
              </div>
          </div>
      </template>

      <template id="tpl-app">
          <div>
              <header class="sticky top-0 z-40 border-b transition-all duration-300 sidebar-backdrop" style="border-color: var(--border); background: var(--card); backdrop-filter: blur(20px);">
                  <div class="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                      <div class="flex h-16 sm:h-20 items-center justify-between gap-3 py-3">
                          <div class="flex items-center gap-3">
                              <button id="sidebarToggle" class="btn btn-secondary px-3 py-2 lg:hidden">☰</button>
                              <div class="logo cursor-pointer text-xl sm:text-2xl" onclick="renderApp()">SilentInterview</div>
                          </div>
                          <div class="flex items-center gap-3">
                              <div class="hidden lg:flex items-center gap-2 mr-2">
                                  <div class="lang-switcher">
                                      <button class="lang-btn active" onclick="changeLang('az')">AZ</button>
                                      <button class="lang-btn" onclick="changeLang('en')">EN</button>
                                      <button class="lang-btn" onclick="changeLang('ru')">RU</button>
                                  </div>
                              </div>

                              <button id="themeToggle" class="btn btn-secondary px-3 py-2 tooltip hidden sm:inline-flex" data-tooltip="Toggle theme" onclick="toggleTheme()">🌓</button>
                              
                              <!-- Çıxış funksiyasını təkcə dillərə yox, user profili üzərinə daşıdıq -->
                              <button class="hidden md:flex items-center gap-2 pill hover:bg-[var(--card2)] transition-colors cursor-pointer" onclick="document.getElementById('logoutBtnHelper').click()">
                                  <span class="dot pulse shrink-0"></span>
                                  <span id="userMeta" class="truncate font-semibold"></span>
                                  <span class="text-xs ml-1 opacity-60" data-key="logout">Çıxış</span>
                              </button>
                              
                              <!-- Köməkçi Gizli Button Logout üçündür -->
                              <button id="logoutBtnHelper" class="hidden-i"></button>
                          </div>
                      </div>
                  </div>
              </header>

              <div class="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 relative">
                  <div id="sidebarOverlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 hidden lg:hidden transition-opacity"></div>
                  
                  <div class="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[290px_1fr]">
                      <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 w-72 h-full transform -translate-x-full transition-transform duration-300 bg-[var(--bg0)] border-r border-[var(--border)] shadow-2xl p-5 lg:static lg:translate-x-0 lg:w-auto lg:h-[calc(100vh-9rem)] lg:bg-transparent lg:border-none lg:shadow-none lg:glass lg:rounded-[30px] lg:sticky lg:top-28 overflow-y-auto">
                          <div class="flex justify-between items-start lg:hidden mb-6">
                              <div class="logo" style="font-size: 1.2rem;" data-key="menu">Menu</div>
                              <button id="sidebarCloseBtn" class="btn btn-ghost px-2 py-1 text-sm">✕</button>
                          </div>
                          
                          <div class="lg:hidden mb-6 lang-switcher w-max mx-auto">
                              <button class="lang-btn active" onclick="changeLang('az')">AZ</button>
                              <button class="lang-btn" onclick="changeLang('en')">EN</button>
                              <button class="lang-btn" onclick="changeLang('ru')">RU</button>
                          </div>

                          <div class="glass-strong rounded-[26px] p-5 premium-card">
                              <div class="mini-label" data-key="workspace">Workspace</div>
                              <div id="workspaceName" class="mt-2 text-xl sm:text-2xl font-black section-title"></div>
                              <div id="workspaceDesc" class="mt-2 text-xs sm:text-sm leading-5" style="color: var(--muted);"></div>
                          </div>
                          <nav id="nav" class="mt-4 space-y-1"></nav>
                          <div class="mt-6 glass-strong rounded-[26px] p-5 text-xs sm:text-sm leading-6" style="color: var(--muted);">
                              <div class="flex items-center gap-2 mb-2">
                                  <span style="font-size: 16px;">💡</span>
                                  <span class="font-bold" style="color: var(--text);" data-key="quick_tip">Quick Tip</span>
                              </div>
                              <span data-key="tip_desc">The camera preview works in modern browsers with permission. Ensure to allow access.</span>
                          </div>
                      </aside>

                      <main id="content" class="space-y-6 fade-in w-full max-w-full overflow-hidden"></main>
                  </div>
              </div>
          </div>
      </template>
    `} />;
};

export default SilentInterview;