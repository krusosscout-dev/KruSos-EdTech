// Full System Backup & Restore Service (สำรองและกู้คืนข้อมูลทั้งระบบ)
import { SubjectStore } from './subjectStore';
import { MasterRosterStore } from './masterRosterStore';

export class BackupService {
  // Export entire system database into a single downloadable JSON file
  static exportFullBackup() {
    try {
      const backupData = {
        appName: 'KruSos-EdTech',
        version: '2.0.0',
        school: 'โรงเรียนวัดบางปูน',
        teacher: 'นายนรากรณ์ จูงาม (ครูซอส)',
        timestamp: new Date().toISOString(),
        backupDateFormatted: new Date().toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        data: {
          subjects: SubjectStore.getSubjects(),
          masterRosters: MasterRosterStore.getMasterRosters()
        }
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const fileName = `krusos-edtech-backup-${dateStr}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, fileName };
    } catch (err) {
      console.error('Error exporting backup:', err);
      return { success: false, error: err.message };
    }
  }

  // Restore entire system database from an uploaded JSON file
  static async importFullBackup(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error('กรุณาเลือกไฟล์สำรองข้อมูล (.json)'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          const parsed = JSON.parse(content);

          // Validate backup structure
          if (!parsed.data || typeof parsed.data !== 'object') {
            throw new Error('โครงสร้างไฟล์สำรองข้อมูลไม่ถูกต้อง');
          }

          const { subjects, masterRosters } = parsed.data;

          if (subjects && typeof subjects === 'object') {
            SubjectStore.saveSubjects(subjects);
          }

          if (masterRosters && typeof masterRosters === 'object') {
            MasterRosterStore.saveMasterRosters(masterRosters);
          }

          resolve({
            success: true,
            appName: parsed.appName,
            backupDate: parsed.backupDateFormatted || parsed.timestamp,
            subjectCount: Object.keys(subjects || {}).length,
            rosterCount: Object.keys(masterRosters || {}).length
          });
        } catch (err) {
          reject(new Error(`ไม่สามารถอ่านไฟล์สำรองข้อมูลได้: ${err.message}`));
        }
      };

      reader.onerror = () => reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
      reader.readAsText(file);
    });
  }
}
