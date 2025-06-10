import React from 'react';

const FaceUploadModal = ({
  isOpen,
  onClose,
  student,
  onFileChange,
  onUpload,
  imagePreview,
  isLoading,
  file,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">
            Yüz Verisi Yükle: {student?.ad} {student?.soyad}
          </p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <div className="field">
            <label className="label">Öğrenci Fotoğrafı</label>
            <p className="help">Lütfen sadece öğrencinin yüzünün net göründüğü bir fotoğraf yükleyin.</p>
            <div className="file has-name is-fullwidth mt-3">
              <label className="file-label">
                <input
                  className="file-input"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={onFileChange}
                />
                <span className="file-cta">
                  <span className="file-icon"><i className="fas fa-upload"></i></span>
                  <span className="file-label">Dosya Seç…</span>
                </span>
                <span className="file-name">
                  {file ? file.name : "Dosya seçilmedi"}
                </span>
              </label>
            </div>
          </div>
          {imagePreview && (
            <div className="field" style={{ textAlign: "center", marginTop: "1rem" }}>
              <label className="label">Önizleme</label>
              <img src={imagePreview} alt="Önizleme" style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ddd' }} />
            </div>
          )}
        </section>
        <footer className="modal-card-foot">
          <button
            className="button is-success"
            onClick={onUpload}
            disabled={!file || isLoading}
          >
            {isLoading ? 'Yükleniyor...' : 'Yükle'}
          </button>
          <button className="button" onClick={onClose}>İptal</button>
        </footer>
      </div>
    </div>
  );
};

export default FaceUploadModal;