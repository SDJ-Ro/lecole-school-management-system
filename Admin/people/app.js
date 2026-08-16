/* =======================================================================
   L'ÉCOLE ADMIN — APPLICATION SCRIPT
   =======================================================================
   HOW THIS FILE IS ORGANISED (search for these section banners):
     1.  ICON LIBRARY            - inline svg icon strings (mini lucide set)
     2.  DATA MODELS              - the static "database" (students, etc.)
     3.  APP STATE                 - every piece of mutable UI state lives here
     4.  GENERIC DOM HELPERS       - tiny helpers used everywhere
     5.  PROFILE CONVERTERS        - turn a student/teacher/... row into a
                                     "directory profile" the modal understands
     6.  MOUNT QUEUE               - lets render() functions "queue up" a
                                     rich widget (Select/DatePicker/...) to be
                                     wired up right after HTML is inserted
     7.  REUSABLE WIDGET: SELECT
     8.  REUSABLE WIDGET: MULTI-SELECT FILTER
     9.  REUSABLE WIDGET: FILTER SELECT (grade / relationship filters)
     10. REUSABLE WIDGET: DATE PICKER
     11. ROUTER (hash based)
     12. SIDEBAR
     13. PEOPLE DIRECTORY PAGE
     14. PROFILE MODAL (view + edit)
     15. ENROLLMENT FORM PAGE
     16. ADD TEACHER / PARENT / MANAGEMENT FORM PAGES
     17. GLOBAL EVENT DELEGATION + INIT

   NAMING CONVENTION — see top of styles.css. In short: this file only
   ever *reads* "j-" prefixed classes/ids/data-attributes to find and
   drive elements. It never reads "c-" classes (those are CSS-only).
   ======================================================================= */

(function () {
  'use strict';

  /* =====================================================================
     1. ICON LIBRARY
     A tiny stand-in for the lucide-react icons used across the source app.
     Each entry is the *inner* svg markup (no outer <svg> tag) so callers
     can control size via the wrapping function.
     ===================================================================== */
  const ICONS = {
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
    pencilLine: '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
    phone: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
    userPlus: '<path d="M2 21a8 8 0 0 1 13.292-6"/><circle cx="10" cy="8" r="5"/><path d="M19 16v6"/><path d="M22 19h-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    bookOpen: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    calendarDays: '<path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    checkCircle2: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    trophy: '<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0z"/><path d="M6 9a4 4 0 0 1-4-4V4a1 1 0 0 1 1-1h3"/><path d="M18 9a4 4 0 0 0 4-4V4a1 1 0 0 0-1-1h-3"/><path d="M7 22h10"/>',
    lockKeyhole: '<circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>',
    trash2: '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    upload: '<path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M6 21h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2"/>'
  };

  /** Build an inline <svg> string for the given icon name. */
  function icon(name, size, extraClass) {
    size = size || 16;
    const body = ICONS[name] || '';
    return '<svg class="c-icon ' + (extraClass || '') + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  /** Directory search box (same markup on all 4 tabs; only class/placeholder/value differ). */
  function searchFieldHtml(inputClass, placeholder, value) {
    return '<div class="c-search-field">' + icon('search', 15, 'c-search-field-icon') + '<input type="text" class="c-search-input ' + inputClass + '" placeholder="' + esc(placeholder) + '" value="' + esc(value) + '" /></div>';
  }

  /* =====================================================================
     2. DATA MODELS
     This is a straight port of the arrays/objects that lived in
     src/pages/People.tsx, src/features/enrollment/EnrollmentContext.tsx
     and src/features/people/DirectoryContext.tsx in the original project.
     ===================================================================== */
  const mockData = window.PEOPLE_MOCK_DATA || {};
  const GRADES = mockData.GRADES || [];
  const CLASS_ACADEMIC_CONTEXT = mockData.CLASS_ACADEMIC_CONTEXT || {};
  const STUDENTS = mockData.STUDENTS || [];
  const TEACHERS = mockData.TEACHERS || [];
  const PARENTS = mockData.PARENTS || [];
  const MANAGEMENT = mockData.MANAGEMENT || [];
  const INITIAL_CLASS_ENROLLMENTS = mockData.INITIAL_CLASS_ENROLLMENTS || {};
  const TAB_THEMES = mockData.TAB_THEMES || {};
  const GRADE_CLASS_MAP = GRADES.reduce(function (map, grade) {
    map[grade.name] = grade.classes;
    return map;
  }, {});

  /* =====================================================================
     3. APP STATE
     Everything the UI can change lives on this single object so re-render
     functions always have one source of truth (mirrors the various
     React useState()/Context values from the original app).
     ===================================================================== */
  const State = {
    // sidebar (Layout.tsx / Sidebar.tsx)
    sidebarCollapsed: false,
    sidebarSelection: 'People',

    // router
    route: 'people',

    // directory context (DirectoryContext.tsx) — records added at runtime
    addedStudents: [],
    addedTeachers: [],
    addedParents: [],
    addedManagement: [],

    // enrollment context (EnrollmentContext.tsx)
    classEnrollments: Object.assign({}, INITIAL_CLASS_ENROLLMENTS),

    // People.tsx local state
    activeTab: 'Students',
    activeGradeId: 'g6',
    activeClass: '6-A',
    studentQuery: '',
    studentActivity: 'all',
    teacherQuery: '',
    teacherSubjectsSelected: [],
    teacherClassesSelected: [],
    teacherTicsSelected: [],
    parentQuery: '',
    parentRelation: 'all',
    parentChildClass: 'all',
    managementQuery: '',
    accountStatusOverrides: {},
    profileOverrides: {},
    directoryFeedback: '',

    // profile modal
    profileModal: null, // { mode: 'view'|'edit', profile: DirectoryProfile }
    profileDraft: null,
    profileNameError: '',
    profileActiveSubTab: 'information',

    // enrollment form state
    enrollmentForm: { fullName: '', firstName: '', lastName: '', dateOfBirth: '', gender: '', nationalId: '', grade: '', classSection: '', religion: '', religionOther: '', homeAddress: '', admissionDate: '', previousSchool: '', bloodGroup: '', medicalNotes: '' },
    enrollmentPhotoName: '',
    enrollmentNotice: null,
    enrollmentSubmitting: false,
    enrollmentDraftSaved: false,

    // add teacher / parent / management forms
    addTeacherForm: { fullName: '', firstName: '', lastName: '', nic: '', dateOfBirth: '', phone: '', personalEmail: '', subjects: '', experience: '', qualifications: [], joinDate: '', emergencyName: '', emergencyPhone: '' },
    addTeacherMessage: '',
    addParentForm: { relationship: '', fullName: '', firstName: '', lastName: '', nic: '', dateOfBirth: '', passport: '', occupation: '', employer: '', mobile: '', homePhone: '', officePhone: '', officeAddress: '', email: '', emergencyName: '', emergencyContact: '' },
    addParentMessage: '',
    addManagementForm: { fullName: '', firstName: '', lastName: '', nic: '', phone: '', personalEmail: '', jobTitle: '', officeLocation: '', joinDate: '', emergencyName: '', emergencyPhone: '' },
    addManagementMessage: ''
  };

  /* =====================================================================
     4. GENERIC DOM HELPERS
     ===================================================================== */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(value) {
    if (value === undefined || value === null) return '';
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function uid(prefix) { return (prefix || 'j') + '-' + Math.random().toString(36).slice(2, 10); }
  function classNames() {
    const parts = [];
    for (let i = 0; i < arguments.length; i++) { if (arguments[i]) parts.push(arguments[i]); }
    return parts.join(' ');
  }
  function toFilterOptions(values) {
    const set = Array.from(new Set(values)).filter(Boolean);
    set.sort(function (a, b) { return a.localeCompare(b); });
    return set.map(function (value) { return { label: value, value: value }; });
  }
  function getChildClasses(children) {
    const result = [];
    children.forEach(function (child) {
      const idx = child.lastIndexOf('—');
      if (idx >= 0) result.push(child.slice(idx + 1).trim());
    });
    return result;
  }
  function classOptionsForGrade(grade) {
    const map = {
      'Grade 6': ['6-A', '6-B', '6-C', '6-D'], 'Grade 7': ['7-A', '7-B', '7-C'],
      'Grade 8': ['8-A', '8-B', '8-C', '8-D'], 'Grade 9': ['9-A', '9-B', '9-C'],
      'Grade 10': ['10-A', '10-B', '10-C', '10-D'], 'Grade 11': ['11-A', '11-B', '11-C']
    };
    return map[grade] || [];
  }
  function withCurrentOption(options, current) {
    const set = Array.from(new Set(options.concat(current ? [current] : [])));
    return set;
  }
  function cloneProfile(profile) { return JSON.parse(JSON.stringify(profile)); }
  function setProfileValue(profile, path, value) {
    const draft = cloneProfile(profile);
    const keys = path.split('.');
    let target = draft;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]] || typeof target[keys[i]] !== 'object') target[keys[i]] = {};
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
    return draft;
  }
  function makeInitials(value) {
    return (value || '').trim().split(/\s+/).filter(Boolean).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
  }
  function createDirectoryId(prefix) { return prefix + '-' + Date.now().toString().slice(-6); }
  function formatDateDisplay(value) {
    if (!value) return 'Not recorded';
    const date = new Date(value + 'T00:00:00');
    if (isNaN(date.getTime())) return 'Not recorded';
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  /* =====================================================================
     5. PROFILE CONVERTERS
     Mirrors toStudentProfile / toTeacherProfile / toParentProfile /
     toManagementProfile / getStudentProfileFromLink from People.tsx.
     ===================================================================== */
  function mapNames(arr) {
    return arr.map(function (item) {
      if (item.firstName && !item.name) {
        item.name = item.firstName + (item.lastName ? ' ' + item.lastName : '');
      }
      if (item.firstName && !item.initials) {
        item.initials = (item.firstName[0] || '') + (item.lastName ? item.lastName[0] : '');
      }
      return item;
    });
  }
  function allStudents() { return mapNames(STUDENTS.concat(State.addedStudents)); }
  function allTeachers() { return mapNames(TEACHERS.concat(State.addedTeachers)); }
  function allParents() { return mapNames(PARENTS.concat(State.addedParents)); }
  function allManagement() { return mapNames(MANAGEMENT.concat(State.addedManagement)); }

  function toStudentProfile(student) {
    const guardian = allParents().find(function (parent) {
      return parent.children.some(function (child) { return child.indexOf(student.name) === 0; });
    });
    return {
      role: 'student', name: student.name, initials: student.initials, id: student.index,
      email: student.email, phone: student.phone, status: student.status, avatarTone: student.avatar,
      subtitle: student.grade + ' · Class ' + student.className,
      student: Object.assign({}, student.profile, {
        grade: student.grade, className: student.className,
        guardian: guardian ? {
          id: guardian.id, initials: guardian.initials, name: guardian.name, relationship: guardian.relation,
          email: guardian.email, phone: guardian.phone,
          accountAccess: guardian.status === 'Active' ? 'Family portal enabled' : 'Family portal disabled',
          status: guardian.status, avatarTone: guardian.tone, isAvailable: true
        } : { isAvailable: false }
      })
    };
  }
  function toTeacherProfile(teacher) {
    const classIncharge = teacher.classTeacherOf ? ('Class Teacher — In charge of ' + teacher.classTeacherOf) : 'Class Teacher (No class assigned)';
    return {
      role: 'teacher', name: teacher.name, initials: teacher.initials, id: teacher.id,
      email: teacher.email, phone: teacher.phone, status: teacher.status, avatarTone: teacher.tone,
      subtitle: classIncharge,
      teacher: {
        classTeacherOf: teacher.classTeacherOf, subject: teacher.subject,
        subjectAssignments: (teacher.classes || []).map(function (className) { return { className: className, subject: teacher.subject }; }),
        tic: teacher.tic,
        workload: (teacher.classes || []).length + ' class' + ((teacher.classes || []).length === 1 ? '' : 'es') + (teacher.classTeacherOf ? ' · Class teacher of ' + teacher.classTeacherOf : ''),
        nic: teacher.nic, dateOfBirth: teacher.dateOfBirth, personalEmail: teacher.personalEmail, experience: teacher.experience, qualification: teacher.qualification, qualifications: teacher.qualifications || [], joinDate: teacher.joinDate, emergencyContact: teacher.emergencyContact, emergencyName: teacher.emergencyName, emergencyPhone: teacher.emergencyPhone
      }
    };
  }
  function toParentProfile(parent) {
    return {
      role: 'parent', name: parent.name, initials: parent.initials, id: parent.id,
      email: parent.email, phone: parent.phone, status: parent.status, avatarTone: parent.tone,
      subtitle: parent.relation + ' · ' + parent.children.length + ' linked student' + (parent.children.length === 1 ? '' : 's'),
      parent: {
        relationship: parent.relation,
        linkedStudents: parent.children.map(function (child) {
          const parts = child.split('—').map(function (p) { return p.trim(); });
          const name = parts[0]; const className = parts[1];
          const student = allStudents().find(function (item) { return item.name === name; });
          return { id: student ? student.index : 'linked-' + name, name: name || 'Unknown student', className: className || 'Class not recorded' };
        }),
        identityReference: parent.identityReference, guardianStatus: parent.guardianStatus,
        occupation: parent.occupation, employer: parent.employer, secondaryContact: parent.secondaryContact,
        emergencyContact: parent.emergencyContact, homeAddress: parent.homeAddress,
        dateOfBirth: parent.dateOfBirth, passport: parent.passport, education: parent.education, annualIncome: parent.annualIncome
      }
    };
  }
  function toManagementProfile(member) {
    return {
      role: 'management', name: member.name, initials: member.initials, id: member.id,
      email: member.email, phone: member.phone, status: member.status, avatarTone: member.tone,
      subtitle: member.jobTitle,
      management: {
        jobTitle: member.jobTitle, officeLocation: member.officeLocation, officeAddress: member.officeLocation || member.officeAddress || '', joiningDate: member.joiningDate,
        personalEmail: member.personalEmail, personalAddress: member.personalAddress, emergencyContact: member.emergencyContact, nic: member.nic
      }
    };
  }
  function getStudentProfileFromLink(link) {
    const parts = link.split('—').map(function (p) { return p.trim(); });
    const name = parts[0]; const className = parts[1];
    const student = allStudents().find(function (item) { return item.name === name; });
    if (student) return toStudentProfile(student);
    return {
      role: 'student', name: name || 'Unknown student',
      initials: name ? name.split(' ').map(function (p) { return p[0]; }).join('').slice(0, 2) : '??',
      id: 'Not in directory', status: 'Unknown', avatarTone: 'bg-alabaster text-midnight',
      subtitle: className ? 'Linked student · Class ' + className : 'Linked student', isKnown: false,
      student: { className: className, guardian: { isAvailable: false } }
    };
  }

  /* =====================================================================
     6. MOUNT QUEUE
     render*() functions build big HTML strings. Whenever they need a rich
     interactive widget (Select / MultiSelect / FilterSelect / DatePicker)
     they don't build it inline — they call queueMount(type, config) which
     returns a small placeholder <span> and remembers the config. Right
     after the HTML string is inserted into the real DOM, flushMounts()
     walks every placeholder and turns it into the real widget.
     ===================================================================== */
  let mountQueue = [];
  function queueMount(type, config) {
    const id = uid('mount');
    mountQueue.push({ id: id, type: type, config: config });
    return '<span class="j-mount" id="' + id + '"></span>';
  }
  function flushMounts(root) {
    const queue = mountQueue;
    mountQueue = [];
    queue.forEach(function (item) {
      const host = document.getElementById(item.id);
      if (!host) return;
      if (item.type === 'select') mountSelect(host, item.config);
      else if (item.type === 'multiselect') mountMultiSelect(host, item.config);
      else if (item.type === 'filterselect') mountFilterSelect(host, item.config);
      else if (item.type === 'datepicker') mountDatePicker(host, item.config);
      else if (item.type === 'customReligion') mountCustomReligion(host, item.config);
    });
  }

  function mountCustomReligion(host, config) {
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'c-enrollment-input';
    input.placeholder = 'Type religion...';
    input.value = config.value === 'Other' ? '' : config.value;
    input.style.paddingRight = '70px';

    input.addEventListener('input', function () {
      State.enrollmentForm.religion = input.value;
    });

    const badge = document.createElement('span');
    badge.style.position = 'absolute';
    badge.style.right = '8px';
    badge.style.fontSize = '10px';
    badge.style.fontWeight = '600';
    badge.style.textTransform = 'uppercase';
    badge.style.color = 'rgba(15, 65, 74, 0.5)';
    badge.style.background = 'rgba(15, 65, 74, 0.08)';
    badge.style.padding = '4px 6px';
    badge.style.borderRadius = '4px';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.gap = '4px';
    badge.style.pointerEvents = 'auto';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.innerHTML = '&times;';
    clearBtn.style.background = 'none';
    clearBtn.style.border = 'none';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.color = 'inherit';
    clearBtn.style.padding = '0';
    clearBtn.style.display = 'flex';
    clearBtn.style.alignItems = 'center';
    clearBtn.style.fontSize = '14px';
    clearBtn.style.lineHeight = '1';

    clearBtn.addEventListener('click', function () {
      State.enrollmentForm.religionCustom = false;
      State.enrollmentForm.religion = '';
      renderEnrollmentPage();
    });

    badge.appendChild(document.createTextNode('Other '));
    badge.appendChild(clearBtn);

    wrap.appendChild(input);
    wrap.appendChild(badge);
    host.parentNode.replaceChild(wrap, host);
  }
  /* =====================================================================
     7. REUSABLE WIDGET: SELECT
     Mirrors src/components/ui/Select.tsx — a button trigger that opens a
     menu "portalled" into #j-portal-root and positioned with fixed
     coordinates so it always escapes any overflow:hidden ancestor.
     config: { value, options (array of strings or {label,value}), onChange,
               tone, placeholder, disabled, ariaLabel, className, plain }
     ===================================================================== */
  function mountSelect(host, config) {
    const tone = config.tone || 'sky';
    const options = (config.options || []).map(function (opt) {
      return typeof opt === 'string' ? { label: opt, value: opt } : opt;
    });
    const wrap = document.createElement('div');
    wrap.className = 'c-select ' + (config.className || '');
    const selected = options.find(function (o) { return o.value === config.value; });
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = classNames('c-select-trigger', 'j-select-trigger', selected ? 'has-value' : '',
      !config.plain ? 'c-select-' + tone : '');
    trigger.disabled = !!config.disabled;
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', config.ariaLabel || config.placeholder || 'Select');
    trigger.innerHTML =
      '<span class="c-select-trigger-text">' + esc(selected ? selected.label : (config.placeholder || 'Select...')) + '</span>' +
      icon('chevronDown', 16, 'c-select-chevron');
    wrap.appendChild(trigger);
    host.replaceWith(wrap);

    let isOpen = false;
    let menuEl = null;

    function closeMenu() {
      isOpen = false;
      trigger.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      if (menuEl) { menuEl.remove(); menuEl = null; }
      document.removeEventListener('mousedown', onOutside, true);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    }
    function onOutside(e) {
      if (wrap.contains(e.target) || (menuEl && menuEl.contains(e.target))) return;
      closeMenu();
    }
    function onKey(e) { if (e.key === 'Escape') { closeMenu(); trigger.focus(); } }

    function positionMenu() {
      if (!menuEl) return;
      const rect = trigger.getBoundingClientRect();
      const pad = 12;
      const belowSpace = window.innerHeight - rect.bottom - pad;
      const aboveSpace = rect.top - pad;
      const above = belowSpace < 176 && aboveSpace > belowSpace;
      const maxHeight = Math.max(96, Math.min(240, (above ? aboveSpace : belowSpace) - 6));
      const width = Math.min(Math.max(rect.width, config.menuMinWidth || 0), window.innerWidth - pad * 2);
      const left = Math.max(pad, Math.min(rect.left, window.innerWidth - width - pad));
      menuEl.style.width = width + 'px';
      menuEl.style.left = left + 'px';
      menuEl.style.maxHeight = maxHeight + 'px';
      if (above) { menuEl.style.top = 'auto'; menuEl.style.bottom = (window.innerHeight - rect.top + 6) + 'px'; }
      else { menuEl.style.bottom = 'auto'; menuEl.style.top = (rect.bottom + 6) + 'px'; }
    }

    function openMenu() {
      if (config.disabled) return;
      isOpen = true;
      trigger.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      menuEl = document.createElement('div');
      menuEl.className = 'c-select-menu';
      menuEl.setAttribute('role', 'listbox');
      if (!options.length) {
        menuEl.innerHTML = '<p class="c-select-option-empty">No options available</p>';
      } else {
        options.forEach(function (opt) {
          const isSel = opt.value === config.value;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = classNames('c-select-option', isSel ? ('is-selected-option c-tone-selected-' + tone) : '');
          btn.setAttribute('role', 'option');
          btn.innerHTML = '<span>' + esc(opt.label) + '</span>' + (isSel ? icon('check', 15) : '');
          btn.addEventListener('click', function () {
            closeMenu();
            config.onChange && config.onChange(opt.value);
          });
          menuEl.appendChild(btn);
        });
      }
      document.getElementById('j-portal-root').appendChild(menuEl);
      positionMenu();
      document.addEventListener('mousedown', onOutside, true);
      document.addEventListener('keydown', onKey, true);
      window.addEventListener('resize', positionMenu);
      window.addEventListener('scroll', positionMenu, true);
    }

    trigger.addEventListener('click', function () { isOpen ? closeMenu() : openMenu(); });
  }

  /* =====================================================================
     8. REUSABLE WIDGET: MULTI-SELECT FILTER
     Mirrors MultiSelectFilter from DirectoryFilterControls.tsx.
     config: { label, options, selected(array), onChange, tone }
     ===================================================================== */
  function mountMultiSelect(host, config) {
    const tone = config.tone || 'sunshine';
    const wrap = document.createElement('div');
    wrap.className = 'c-multiselect';
    host.replaceWith(wrap);

    function render() {
      wrap.innerHTML = '';
      const selectedOptions = config.options.filter(function (o) { return config.selected.indexOf(o.value) !== -1; });
      const label = config.selected.length === 0 ? ('All ' + config.label.toLowerCase())
        : config.selected.length === 1 ? selectedOptions[0].label
          : config.selected.length + ' selected';
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = classNames('c-filter-trigger', config.selected.length ? ('c-tone-active-' + tone) : '');
      trigger.innerHTML = '<span class="c-select-trigger-text"><span class="c-filter-trigger-label">' + esc(config.label) + ':</span>' + esc(label) + '</span>' + icon('chevronDown', 16, 'c-select-chevron');
      wrap.appendChild(trigger);

      const chipsWrap = document.createElement('div');
      chipsWrap.className = 'c-multiselect-chips';
      selectedOptions.forEach(function (opt) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'c-multiselect-chip c-tone-active-' + tone;
        chip.innerHTML = '<span>' + esc(opt.label) + '</span>' + icon('x', 11);
        chip.addEventListener('click', function () { toggle(opt.value); });
        chipsWrap.appendChild(chip);
      });
      if (selectedOptions.length) wrap.appendChild(chipsWrap);

      let menuEl = null;
      function closeMenu() {
        trigger.classList.remove('is-open-filter');
        if (menuEl) { menuEl.remove(); menuEl = null; }
        document.removeEventListener('mousedown', onOutside, true);
      }
      function onOutside(e) { if (!wrap.contains(e.target)) closeMenu(); }
      function openMenu() {
        trigger.classList.add('is-open-filter');
        menuEl = document.createElement('div');
        menuEl.className = 'c-filter-panel';
        menuEl.style.width = '16rem';
        let inner = '<div class="c-multiselect-header"><span class="c-multiselect-header-label">' + esc(config.label) + '</span>';
        if (config.selected.length) inner += '<button type="button" class="c-multiselect-clear j-clear-multiselect">Clear</button>';
        inner += '</div><div class="c-filter-panel-scroll">';
        config.options.forEach(function (opt) {
          const isSel = config.selected.indexOf(opt.value) !== -1;
          inner += '<button type="button" class="c-filter-option j-multiselect-opt" data-value="' + esc(opt.value) + '" style="display:flex;align-items:center;gap:0.5rem;">' +
            '<span class="c-checkbox-swatch ' + (isSel ? ('is-checked c-tone-check-' + tone) : '') + '">' + (isSel ? icon('check', 11) : '') + '</span>' +
            '<span class="c-select-trigger-text">' + esc(opt.label) + '</span></button>';
        });
        inner += '</div>';
        menuEl.innerHTML = inner;
        wrap.appendChild(menuEl);
        const clearBtn = menuEl.querySelector('.j-clear-multiselect');
        if (clearBtn) clearBtn.addEventListener('click', function () { config.onChange([]); });
        qsa('.j-multiselect-opt', menuEl).forEach(function (btn) {
          btn.addEventListener('click', function () { toggle(btn.getAttribute('data-value')); });
        });
        document.addEventListener('mousedown', onOutside, true);
      }
      trigger.addEventListener('click', function () { menuEl ? closeMenu() : openMenu(); });
    }
    function toggle(value) {
      const idx = config.selected.indexOf(value);
      const next = idx === -1 ? config.selected.concat([value]) : config.selected.filter(function (v) { return v !== value; });
      config.onChange(next);
    }
    render();
  }

  /* =====================================================================
     9. REUSABLE WIDGET: FILTER SELECT (single, "Grade: 6" style)
     Mirrors FilterSelect from DirectoryFilterControls.tsx.
     config: { label, options, value, onChange, tone, ariaLabel }
     ===================================================================== */
  function mountFilterSelect(host, config) {
    const tone = config.tone || 'sky';
    const wrap = document.createElement('div');
    wrap.className = 'c-filter-select';
    host.replaceWith(wrap);

    const selected = config.options.find(function (o) { return o.value === config.value; });
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'c-filter-trigger';
    trigger.innerHTML = '<span class="c-select-trigger-text"><span class="c-filter-trigger-label">' + esc(config.label) + ':</span>' + esc(selected ? selected.label : 'All') + '</span>' + icon('chevronDown', 16, 'c-select-chevron');
    wrap.appendChild(trigger);

    let menuEl = null;
    function closeMenu() {
      trigger.classList.remove('is-open-filter');
      if (menuEl) { menuEl.remove(); menuEl = null; }
      document.removeEventListener('mousedown', onOutside, true);
    }
    function onOutside(e) { if (!wrap.contains(e.target)) closeMenu(); }
    function openMenu() {
      trigger.classList.add('is-open-filter');
      menuEl = document.createElement('div');
      menuEl.className = 'c-filter-panel';
      let inner = '<p class="c-filter-panel-title">' + esc(config.label) + '</p><div class="c-filter-panel-scroll">';
      config.options.forEach(function (opt) {
        const isSel = opt.value === config.value;
        inner += '<button type="button" class="c-filter-option j-filter-opt ' + (isSel ? ('c-tone-active-' + tone) : '') + '" data-value="' + esc(opt.value) + '">' +
          '<span class="c-select-trigger-text">' + esc(opt.label) + '</span>' + (isSel ? icon('check', 14) : '') + '</button>';
      });
      inner += '</div>';
      menuEl.innerHTML = inner;
      wrap.appendChild(menuEl);
      qsa('.j-filter-opt', menuEl).forEach(function (btn) {
        btn.addEventListener('click', function () { closeMenu(); config.onChange(btn.getAttribute('data-value')); });
      });
      document.addEventListener('mousedown', onOutside, true);
    }
    trigger.addEventListener('click', function () { menuEl ? closeMenu() : openMenu(); });
  }

  /* =====================================================================
     10. REUSABLE WIDGET: DATE PICKER
     Mirrors src/components/ui/DatePicker.tsx — trigger + portalled
     calendar dialog with month/year quick-selects.
     config: { value (ISO yyyy-mm-dd), onChange, tone, ariaLabel, disabled }
     ===================================================================== */
  const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  function dpToIso(date) {
    const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  function parseDpDate(val) {
    if (!val) return new Date();
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const d = new Date(val + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) return parsed;
    return new Date();
  }
  function dpFormat(value) {
    if (!value) return '';
    const date = parseDpDate(value);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }
  function dpStartOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
  function dpMondayIndex(date) { return (date.getDay() + 6) % 7; }
  function dpAddDays(date, amount) { const n = new Date(date); n.setDate(n.getDate() + amount); return n; }
  function dpAddMonths(date, amount) { const n = new Date(date); n.setMonth(n.getMonth() + amount); return n; }
  function dpCalendarDays(month) {
    const first = dpStartOfMonth(month);
    const offset = dpMondayIndex(first);
    const gridStart = dpAddDays(first, -offset);
    const days = [];
    for (let i = 0; i < 42; i++) days.push(dpAddDays(gridStart, i));
    return days;
  }
  const DP_MONTH_OPTIONS = Array.from({ length: 12 }, function (_, i) {
    return { label: new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(new Date(2024, i, 1)), value: i };
  });
  const DP_YEAR_OPTIONS = Array.from({ length: 86 }, function (_, i) { return { label: String(1950 + i), value: 1950 + i }; });

  function mountDatePicker(host, config) {
    const tone = config.tone || 'sky';
    const wrap = document.createElement('div');
    wrap.className = 'c-datepicker';
    host.replaceWith(wrap);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'c-datepicker-trigger c-dp-' + tone;
    trigger.disabled = !!config.disabled;
    function refreshTriggerLabel() {
      trigger.innerHTML = '<span class="' + (config.value ? '' : 'c-dp-placeholder') + '">' + esc(dpFormat(config.value)) + '</span>' + icon('calendarDays', 17);
    }
    refreshTriggerLabel();
    wrap.appendChild(trigger);

    let menuEl = null;
    let visibleMonth = dpStartOfMonth(parseDpDate(config.value));

    function closeMenu() {
      if (menuEl) { menuEl.remove(); menuEl = null; }
      document.removeEventListener('mousedown', onOutside, true);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('scroll', onScroll, true);
    }
    function onOutside(e) { if (!wrap.contains(e.target) && !(menuEl && menuEl.contains(e.target))) closeMenu(); }
    function onKey(e) { if (e.key === 'Escape') { closeMenu(); trigger.focus(); } }
    function onScroll(e) { if (menuEl && !menuEl.contains(e.target)) closeMenu(); }

    function selectDate(date) {
      config.value = dpToIso(date);
      config.onChange && config.onChange(config.value);
      refreshTriggerLabel();
      visibleMonth = dpStartOfMonth(date);
      closeMenu();
    }

    function renderCalendar() {
      const days = dpCalendarDays(visibleMonth);
      const selIso = config.value || '';
      const todayIso = dpToIso(new Date());
      let daysHtml = '';
      days.forEach(function (date) {
        const iso = dpToIso(date);
        const inMonth = date.getMonth() === visibleMonth.getMonth();
        const isSel = iso === selIso;
        const isToday = iso === todayIso;
        daysHtml += '<button type="button" class="c-dp-day j-dp-day ' + (isSel ? ('c-dp-selected-' + tone) : ('c-dp-hover-' + tone)) + ' ' + (inMonth ? '' : 'c-dp-outside') + ' ' + (isToday ? 'is-today-day' : '') + '" data-iso="' + iso + '">' + date.getDate() + '</button>';
      });
      let html =
        '<div class="c-dp-header">' +
        '<button type="button" class="c-dp-nav-btn c-dp-prev c-dp-hover-' + tone + '" aria-label="Previous month">' + icon('chevronLeft', 17) + '</button>' +
        '<div class="c-dp-month-year">' +
        '<span class="j-dp-month-host"></span>' +
        '<span class="j-dp-year-host"></span>' +
        '</div>' +
        '<button type="button" class="c-dp-nav-btn c-dp-next c-dp-hover-' + tone + '" aria-label="Next month">' + icon('chevronRight', 17) + '</button>' +
        '</div>' +
        '<div class="c-dp-weekdays">' + WEEKDAY_LABELS.map(function (w) { return '<span class="c-dp-weekday">' + w + '</span>'; }).join('') + '</div>' +
        '<div class="c-dp-days">' + daysHtml + '</div>' +
        '<div class="c-dp-footer"><p class="c-dp-hint">Use arrow keys to move by day.</p><button type="button" class="c-dp-today-btn c-dp-hover-' + tone + ' j-dp-today">Today</button></div>';
      menuEl.innerHTML = html;

      qsa('.j-dp-day', menuEl).forEach(function (btn) {
        btn.addEventListener('click', function () { selectDate(new Date(btn.getAttribute('data-iso') + 'T00:00:00')); });
      });
      qs('.c-dp-prev', menuEl).addEventListener('click', function () { visibleMonth = dpAddMonths(visibleMonth, -1); renderCalendar(); positionMenu(); });
      qs('.c-dp-next', menuEl).addEventListener('click', function () { visibleMonth = dpAddMonths(visibleMonth, 1); renderCalendar(); positionMenu(); });
      qs('.j-dp-today', menuEl).addEventListener('click', function () { selectDate(new Date()); });
      mountHeaderSelect(qs('.j-dp-month-host', menuEl), {
        ariaLabel: 'Select month', tone: tone, isYear: false, options: DP_MONTH_OPTIONS, value: visibleMonth.getMonth(),
        onChange: function (m) { visibleMonth = new Date(visibleMonth.getFullYear(), m, 1); renderCalendar(); positionMenu(); }
      });
      mountHeaderSelect(qs('.j-dp-year-host', menuEl), {
        ariaLabel: 'Select year', tone: tone, isYear: true, options: DP_YEAR_OPTIONS, value: visibleMonth.getFullYear(),
        onChange: function (y) { visibleMonth = new Date(y, visibleMonth.getMonth(), 1); renderCalendar(); positionMenu(); }
      });
    }

    function positionMenu() {
      if (!menuEl) return;
      const rect = trigger.getBoundingClientRect();
      const pad = 12; const menuHeight = 390;
      const width = Math.min(320, window.innerWidth - pad * 2);
      const above = (window.innerHeight - rect.bottom) < menuHeight && rect.top > (window.innerHeight - rect.bottom);
      menuEl.style.width = width + 'px';
      menuEl.style.left = Math.max(pad, Math.min(rect.left, window.innerWidth - width - pad)) + 'px';
      if (above) { menuEl.style.top = 'auto'; menuEl.style.bottom = (window.innerHeight - rect.top + 8) + 'px'; }
      else { menuEl.style.bottom = 'auto'; menuEl.style.top = (rect.bottom + 8) + 'px'; }
    }

    function openMenu() {
      if (config.disabled) return;
      visibleMonth = dpStartOfMonth(parseDpDate(config.value));
      menuEl = document.createElement('div');
      menuEl.className = 'c-dp-calendar';
      document.getElementById('j-portal-root').appendChild(menuEl);
      renderCalendar();
      positionMenu();
      document.addEventListener('mousedown', onOutside, true);
      document.addEventListener('keydown', onKey, true);
      window.addEventListener('scroll', onScroll, true);
    }
    trigger.addEventListener('click', function () { menuEl ? closeMenu() : openMenu(); });
  }

  /** Small header dropdown (month / year) used only inside the date picker calendar. */
  function mountHeaderSelect(host, config) {
    if (!host) return;
    const tone = config.tone;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'c-dp-header-trigger c-dp-' + tone + (config.isYear ? ' c-dp-year' : '');
    const selected = config.options.find(function (o) { return o.value === config.value; });
    trigger.innerHTML = '<span class="c-select-trigger-text">' + esc(selected ? selected.label : '') + '</span>' + icon('chevronDown', 14, 'c-select-chevron');
    host.appendChild(trigger);
    let menuEl = null;
    function close() { if (menuEl) { menuEl.remove(); menuEl = null; } document.removeEventListener('mousedown', onOutside, true); }
    function onOutside(e) { if (!host.contains(e.target)) close(); }
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (menuEl) { close(); return; }
      menuEl = document.createElement('div');
      menuEl.className = 'c-dp-header-menu c-dp-menu-' + tone + (config.isYear ? ' c-dp-year-menu' : '');
      config.options.forEach(function (opt) {
        const isSel = opt.value === config.value;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'c-filter-option ' + (isSel ? ('c-dp-selected-' + tone) : ('c-dp-hover-' + tone));
        btn.style.justifyContent = 'space-between';
        btn.innerHTML = '<span>' + esc(opt.label) + '</span>' + (isSel ? icon('check', 14) : '');
        btn.addEventListener('click', function () { close(); config.onChange(opt.value); });
        menuEl.appendChild(btn);
      });
      host.appendChild(menuEl);
      document.addEventListener('mousedown', onOutside, true);
    });
  }

  /* =====================================================================
     11. ROUTER
     Simple hash based router: #/people, #/enrollment, #/add-teacher,
     #/add-parent, #/add-management. Mirrors the <Routes> from App.tsx.
     ===================================================================== */
  const ROUTE_PAGE_IDS = {
    people: 'j-page-people',
    enrollment: 'j-page-enrollment',
    'add-teacher': 'j-page-add-teacher',
    'add-parent': 'j-page-add-parent',
    'add-management': 'j-page-add-management'
  };

  function navigate(route, query) {
    let hash = '#/' + route;
    if (query) hash += '?' + query;
    window.location.hash = hash;
  }

  function parseHash() {
    const raw = window.location.hash.replace(/^#\/?/, '');
    const [path, queryString] = raw.split('?');
    const params = new URLSearchParams(queryString || '');
    return { route: path || 'people', params: params };
  }

  function applyRoute() {
    const parsed = parseHash();
    const route = ROUTE_PAGE_IDS[parsed.route] ? parsed.route : 'people';
    State.route = route;
    Object.keys(ROUTE_PAGE_IDS).forEach(function (key) {
      const el = document.getElementById(ROUTE_PAGE_IDS[key]);
      if (el) el.classList.toggle('is-active-page', key === route);
    });
    if (route === 'people') {
      const requestedClass = parsed.params.get('class');
      const requestedTab = parsed.params.get('tab');
      const requestedProfile = parsed.params.get('profile') || new URLSearchParams(window.location.search).get('profile');
      
      if (requestedTab === 'Teachers' || requestedTab === 'Parents' || requestedTab === 'Management Panel') {
        State.activeTab = requestedTab;
      } else if (requestedTab === 'Students') {
        State.activeTab = 'Students';
      }
      if (requestedClass) {
        const grade = GRADES.find(function (g) { return g.classes.indexOf(requestedClass) !== -1; });
        if (grade) { State.activeGradeId = grade.id; State.activeClass = requestedClass; State.activeTab = 'Students'; }
      }
      renderDirectoryPage();

      if (requestedProfile === 'M-001' || requestedProfile === 'alex-thompson') {
        State.activeTab = 'Management Panel';
        renderDirectoryPage();
        setTimeout(function() {
          const alexUser = MANAGEMENT_PANEL.find(function(m) { return m.id === 'M-001'; }) || MANAGEMENT_PANEL[0];
          if (alexUser) openProfileModal('management', alexUser);
        }, 100);
      }
    } else if (route === 'enrollment') {
      renderEnrollmentPage();
    } else if (route === 'add-teacher') {
      renderAddTeacherPage();
    } else if (route === 'add-parent') {
      renderAddParentPage();
    } else if (route === 'add-management') {
      renderAddManagementPage();
    }
    window.scrollTo(0, 0);
    const mainEl = document.getElementById('j-main');
    if (mainEl) mainEl.scrollTop = 0;
  }

  window.addEventListener('hashchange', applyRoute);

  /* =====================================================================
     13. PEOPLE DIRECTORY PAGE
     Mirrors src/pages/People.tsx. renderDirectoryPage() is the single
     entry point; it rebuilds the tab list, the feedback banner and the
     currently active role panel (Students / Teachers / Parents /
     Management Panel) every time state changes.
     ===================================================================== */
  function getClassEnrollment(className) { return State.classEnrollments[className] || 0; }
  function getAccountStatus(id, fallbackStatus) { return State.accountStatusOverrides[id] || fallbackStatus; }
  function getPersonDetails(id, person) {
    const override = State.profileOverrides[id];
    return {
      name: (override && override.name) || person.name,
      email: (override && override.email) || person.email,
      phone: (override && override.phone) || person.phone
    };
  }
  function updateAccountStatus(id, name, status) {
    State.accountStatusOverrides[id] = status;
    if (State.profileModal && State.profileModal.profile.id === id) {
      State.profileModal.profile.status = status;
    }
    State.directoryFeedback = status === 'Deactivated' ? '' : (name + "'s account is now " + status.toLowerCase() + '.');
    renderDirectoryPage();
    if (State.profileModal) renderProfileModal();
  }

  function directoryTabsHtml() {
    const tabs = ['Students', 'Teachers', 'Parents', 'Management Panel'];
    return '<div class="c-tablist" role="tablist" aria-label="Directory roles">' +
      tabs.map(function (tab) {
        const theme = TAB_THEMES[tab];
        const isActive = State.activeTab === tab;
        const pill = isActive ? '<span class="c-tab-btn-pill ' + theme.accentClass + '" aria-hidden="true"></span>' : '';
        return '<button type="button" role="tab" aria-selected="' + isActive + '" class="c-tab-btn j-tab-btn ' + (isActive ? 'is-active-tab' : '') + '" data-tab="' + esc(tab) + '" style="' + (isActive ? 'color:' + (theme.tone === 'sky' ? 'var(--color-midnight)' : 'var(--color-white)') + ';' : '') + '">' +
          pill + '<span class="c-tab-btn-label">' + esc(tab) + '</span></button>';
      }).join('') + '</div>';
  }

  function renderDirectoryTabsOnly() {
    document.getElementById('j-directory-tablist').outerHTML = directoryTabsHtml().replace('c-tablist', 'c-tablist" id="j-directory-tablist');
    qsa('.j-tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        State.activeTab = btn.getAttribute('data-tab');
        renderDirectoryPage();
      });
    });
  }

  function renderDirectoryFeedback() {
    const el = document.getElementById('j-directory-feedback');
    if (State.directoryFeedback) {
      el.style.display = '';
      el.textContent = State.directoryFeedback;
    } else {
      el.style.display = 'none';
    }
  }

  function contextCardHtml(label, value, isLink, dataAction) {
    const tag = isLink ? 'button type="button" class="c-context-card j-context-card" data-action="' + dataAction + '"' : 'div class="c-context-card"';
    const closeTag = isLink ? 'button' : 'div';
    return '<' + tag + '><p class="c-context-card-label">' + esc(label) + '</p><p class="c-context-card-value ' + (isLink ? 'c-linkish' : '') + '">' + esc(value) + '</p></' + closeTag + '>';
  }

  function renderDirectoryPage() {
    renderDirectoryTabsOnly();
    renderDirectoryFeedback();
    const host = document.getElementById('j-directory-panel-host');
    const tab = State.activeTab;
    let html = '';
    if (tab === 'Students') html = renderStudentsPanel();
    else if (tab === 'Teachers') html = renderTeachersPanel();
    else if (tab === 'Parents') html = renderParentsPanel();
    else html = renderManagementPanel();
    host.innerHTML = html;
    flushMounts();
    wireDirectoryPanelEvents(tab);
  }

  function renderStudentsPanel() {
    const theme = TAB_THEMES.Students;
    const grade = GRADES.find(function (g) { return g.id === State.activeGradeId; }) || GRADES[0];
    const context = CLASS_ACADEMIC_CONTEXT[State.activeClass] || { classTeacher: 'Class teacher assignment pending' };
    const classTeacherProfile = allTeachers().find(function (t) { return t.name === context.classTeacher; });
    const activityOptions = [{ label: 'All', value: 'all' }, { label: 'No activity', value: 'none' }]
      .concat(toFilterOptions(allStudents().reduce(function (acc, s) { return acc.concat(s.activities); }, [])));

    const students = allStudents().filter(function (student) {
      const q = State.studentQuery.trim().toLowerCase();
      const matchesSearch = !q || [student.name, student.index, student.email].join(' ').toLowerCase().indexOf(q) !== -1;
      const matchesClass = student.className === State.activeClass;
      const matchesActivity = State.studentActivity === 'all' || (State.studentActivity === 'none' ? student.activities.length === 0 : student.activities.indexOf(State.studentActivity) !== -1);
      return matchesSearch && matchesClass && matchesActivity;
    });

    let rows = '';
    if (students.length) {
      students.forEach(function (student) {
        const details = getPersonDetails(student.index, student);
        const status = getAccountStatus(student.index, student.status);
        const getActStyle = function (a) {
          const base = 'text-transform:uppercase; font-weight:700; font-size:10px; letter-spacing:0.04em; padding:0.25rem 0.6rem; border-radius:0.375rem;';
          if (!a) return 'background:#f4ebe1; color:var(--color-midnight); ' + base;
          const n = String(a).toLowerCase();
          if (n.indexOf('debating') !== -1) return 'background:#f4ebe1; color:var(--color-midnight); ' + base;
          if (n.indexOf('choir') !== -1) return 'background:rgba(127,199,204,0.2); color:var(--color-deepsea); ' + base;
          if (n.indexOf('robotics') !== -1) return 'background:rgba(234,137,19,0.2); color:var(--color-midnight); ' + base;
          if (n.indexOf('swimming') !== -1) return 'background:rgba(150,192,206,0.3); color:var(--color-midnight); ' + base;
          if (n.indexOf('science') !== -1) return 'background:rgba(164,171,152,0.3); color:var(--color-moss); ' + base;
          if (n.indexOf('football') !== -1) return 'background:rgba(175,80,49,0.15); color:var(--color-terracotta); ' + base;
          return 'background:#f4ebe1; color:var(--color-midnight); ' + base;
        };
        const activities = student.activities.length
          ? '<div class="c-tag-row">' + student.activities.map(function (a) { return '<span class="c-tag" style="' + getActStyle(a) + '">' + esc(a) + '</span>'; }).join('') + '</div>'
          : '<span class="c-tag-muted">None</span>';
        rows +=
          '<tr class="' + theme.rowHover + '">' +
          '<td><div class="c-person-cell"><div class="c-avatar c-avatar-sm ' + (student.avatar || '') + '">' + esc(student.initials) + '</div>' +
          '<span style="font-weight:600;font-size:0.875rem;color:var(--midnight);">' + esc(details.name) + '</span></div></td>' +
          '<td style="font-size:0.75rem;font-weight:500;color:rgba(15,65,74,0.7);">' + esc(student.index) + '</td>' +
          '<td>' + activities + '</td>' +
          '<td style="font-size:0.75rem;color:rgba(15,65,74,0.8);"><span class="c-mail-inline">' + icon('mail', 14, 'c-icon-muted') + esc(details.email || 'Not recorded') + '</span></td>' +
          '<td>' + queueMount('select', {
            value: status, options: ['Active', 'Deactivated'], tone: 'sky', ariaLabel: 'Account status for ' + student.name, className: '[min-width:9rem]',
            onChange: function (v) { updateAccountStatus(student.index, student.name, v); }
          }) + '</td>' +
          '<td class="c-align-right"><div class="c-row-actions">' +
          '<button type="button" class="c-row-action-btn j-open-profile" data-role="student" data-id="' + esc(student.index) + '">' + icon('eye', 14) + '<span class="c-row-action-label">View</span></button>' +
          '<button type="button" class="c-row-action-btn j-edit-profile" data-role="student" data-id="' + esc(student.index) + '">' + icon('pencilLine', 14) + '<span class="c-row-action-label">Edit</span></button>' +
          '</div></td>' +
          '</tr>';
      });
    } else {
      rows = '<tr class="c-empty-row"><td colspan="6"><p class="c-empty-title">No students match these filters.</p><p class="c-empty-desc">Try a different search term or clear the filters.</p><button type="button" class="c-empty-clear j-clear-student-filters">Clear filters</button></td></tr>';
    }

    return (
      '<div class="c-panel">' +
      '<div class="c-panel-toolbar" style="background:' + theme.tint + ';">' +
      '<div class="c-panel-toolbar-row">' +
      '<div class="c-toolbar-left">' +
      queueMount('filterselect', {
        label: 'Grade', ariaLabel: 'Select student grade', tone: 'sky', value: State.activeGradeId,
        options: GRADES.map(function (g) { return { label: g.name, value: g.id }; }),
        onChange: function (id) { const g = GRADES.find(function (x) { return x.id === id; }); if (g) { State.activeGradeId = id; State.activeClass = g.classes[0]; renderDirectoryPage(); } }
      }) +
      '<div class="c-class-chip-row">' + grade.classes.map(function (c) {
        return '<button type="button" class="c-class-chip j-select-class ' + (State.activeClass === c ? 'is-active-chip' : '') + '" data-class="' + esc(c) + '">' + esc(c) + '</button>';
      }).join('') + '</div>' +
      '</div>' +
      '<button type="button" class="c-btn-accent ' + theme.accentClass + ' j-nav-link" data-j-route="enrollment" aria-label="Open the student enrollment form">' + icon('userPlus', 15) + 'Add Student</button>' +
      '</div>' +
      '</div>' +
      '<div class="c-panel-context">' +
      '<div class="c-context-row">' +
      '<div><h2 class="c-context-title c-font-display">Class ' + esc(State.activeClass) + '</h2></div>' +
      '<div class="c-toolbar-right">' +
      searchFieldHtml('j-student-search', 'Search students...', State.studentQuery) +
      queueMount('filterselect', {
        label: 'Activity', ariaLabel: 'Filter students by extracurricular activity', tone: 'sky', value: State.studentActivity, options: activityOptions,
        onChange: function (v) { State.studentActivity = v; renderDirectoryPage(); }
      }) +
      (State.studentQuery || State.studentActivity !== 'all' ? '<button type="button" class="c-clear-btn j-clear-student-filters">Clear</button>' : '') +
      '</div>' +
      '</div>' +
      '<div class="c-context-cards">' +
      contextCardHtml('Enrollment', getClassEnrollment(State.activeClass).toLocaleString() + ' students', false) +
      (classTeacherProfile
        ? contextCardHtml('Class teacher', context.classTeacher, true, 'open-class-teacher')
        : contextCardHtml('Class teacher', context.classTeacher, false)) +
      '</div>' +
      '</div>' +
      '<div class="c-result-summary">' + students.length + ' student' + (students.length === 1 ? '' : 's') + ' found</div>' +
      '<div class="c-table-scroll"><table class="c-table"><thead><tr style="background:' + theme.headerTint + ';">' +
      '<th>Student</th><th>Reg. Number</th><th>Extra-Curricular Activities</th><th>Student Email</th><th>Account access</th><th class="c-align-right">Actions</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</div>'
    );
  }

  function renderTeachersPanel() {
    const theme = TAB_THEMES.Teachers;
    const subjects = toFilterOptions(allTeachers().map(function (t) { return t.subject; }));
    const classes = toFilterOptions(allTeachers().reduce(function (acc, t) { return acc.concat(t.classes); }, []));
    const tics = toFilterOptions(allTeachers().map(function (t) { return t.tic; }));

    const teachers = allTeachers().filter(function (teacher) {
      const q = State.teacherQuery.trim().toLowerCase();
      const matchesSearch = !q || [teacher.name, teacher.id, teacher.subject, teacher.role, teacher.tic, teacher.email].join(' ').toLowerCase().indexOf(q) !== -1;
      const matchesSubjects = !State.teacherSubjectsSelected.length || State.teacherSubjectsSelected.indexOf(teacher.subject) !== -1;
      const matchesClasses = !State.teacherClassesSelected.length || teacher.classes.some(function (c) { return State.teacherClassesSelected.indexOf(c) !== -1; });
      const matchesTics = !State.teacherTicsSelected.length || State.teacherTicsSelected.indexOf(teacher.tic) !== -1;
      return matchesSearch && matchesSubjects && matchesClasses && matchesTics;
    });

    let rows = '';
    if (teachers.length) {
      teachers.forEach(function (teacher) {
        const details = getPersonDetails(teacher.id, teacher);
        const status = getAccountStatus(teacher.id, teacher.status);
        rows +=
          '<tr class="' + theme.rowHover + '">' +
          '<td><div class="c-person-cell"><div class="c-avatar c-avatar-md ' + (teacher.tone || '') + '">' + esc(teacher.initials) + '</div>' +
          '<span style="font-weight:600;font-size:0.875rem;color:var(--midnight);">' + esc(details.name) + '</span></div></td>' +
          '<td style="font-size:0.75rem;font-weight:700;">' + esc(teacher.id) + '</td>' +
          '<td><p style="font-size:0.75rem;font-weight:600;">' + esc(teacher.subject) + '</p><div class="c-tag-row" style="margin-top:0.25rem;flex-wrap:nowrap;">' +
          teacher.classes.map(function (c) { return '<span class="c-tag" style="background:rgba(234,137,19,0.2);color:var(--color-midnight);white-space:nowrap;">' + esc(c) + '</span>'; }).join('') + '</div></td>' +
          '<td><p style="font-size:0.75rem;font-weight:600;color:rgba(15,65,74,0.8);margin:0;display:flex;align-items:center;gap:6px;line-height:1.2;">' +
          '<span>' + esc(teacher.role === 'Class Teacher' ? 'Class' : teacher.role) + '</span>' +
          (teacher.classTeacherOf ? '<span class="c-tag" style="background:rgba(234,137,19,0.2);color:var(--color-midnight);font-weight:700;font-size:11px;margin:0;vertical-align:middle;white-space:nowrap;">' + esc(teacher.classTeacherOf) + '</span>' : '') +
          '</p>' +
          (teacher.tic ? '<p style="margin-top:0.25rem;font-size:11px;font-weight:500;color:rgba(15,65,74,0.5);white-space:nowrap;">TIC: ' + esc(teacher.tic) + '</p>' : '') +
          '</td>' +
          '<td class="c-stack-tight"><span class="c-contact-line">' + icon('mail', 12, 'c-icon-muted') + esc(details.email || 'Not recorded') + '</span><span class="c-contact-line">' + icon('phone', 12, 'c-icon-muted') + esc(details.phone || 'Not recorded') + '</span></td>' +
          '<td>' + queueMount('select', {
            value: status, options: ['Active', 'Deactivated'], tone: 'sunshine', ariaLabel: 'Account status for ' + teacher.name,
            onChange: function (v) { updateAccountStatus(teacher.id, teacher.name, v); }
          }) + '</td>' +
          '<td class="c-align-right"><div class="c-row-actions">' +
          '<button type="button" class="c-row-action-btn j-open-profile" data-role="teacher" data-id="' + esc(teacher.id) + '">' + icon('eye', 14) + '<span class="c-row-action-label">View</span></button>' +
          '<button type="button" class="c-row-action-btn j-edit-profile" data-role="teacher" data-id="' + esc(teacher.id) + '">' + icon('pencilLine', 14) + '<span class="c-row-action-label">Edit</span></button>' +
          '</div></td>' +
          '</tr>';
      });
    } else {
      rows = '<tr class="c-empty-row"><td colspan="7"><p class="c-empty-title">No teachers match these filters.</p><p class="c-empty-desc">Try a different search term or clear the filters.</p><button type="button" class="c-empty-clear j-clear-teacher-filters">Clear filters</button></td></tr>';
    }

    return (
      '<div class="c-panel">' +
      '<div class="c-panel-toolbar" style="background:' + theme.tint + ';">' +
      '<div class="c-panel-toolbar-row c-wrap-row">' +
      searchFieldHtml('j-teacher-search', 'Search teachers...', State.teacherQuery) +
      queueMount('multiselect', { label: 'Subject', tone: 'sunshine', options: subjects, selected: State.teacherSubjectsSelected, onChange: function (v) { State.teacherSubjectsSelected = v; renderDirectoryPage(); } }) +
      queueMount('multiselect', { label: 'Class', tone: 'sunshine', options: classes, selected: State.teacherClassesSelected, onChange: function (v) { State.teacherClassesSelected = v; renderDirectoryPage(); } }) +
      queueMount('multiselect', { label: 'TIC programme', tone: 'sunshine', options: tics, selected: State.teacherTicsSelected, onChange: function (v) { State.teacherTicsSelected = v; renderDirectoryPage(); } }) +
      (State.teacherQuery || State.teacherSubjectsSelected.length || State.teacherClassesSelected.length || State.teacherTicsSelected.length ? '<button type="button" class="c-clear-btn j-clear-teacher-filters">Clear</button>' : '') +
      '<button type="button" class="c-btn-accent ' + theme.accentClass + ' j-nav-link" style="margin-left:auto;" data-j-route="add-teacher">' + icon('userPlus', 15) + 'Add Teacher</button>' +
      '</div>' +
      '</div>' +
      '<div class="c-result-summary">' + teachers.length + ' teacher' + (teachers.length === 1 ? '' : 's') + ' found</div>' +
      '<div class="c-table-scroll"><table class="c-table"><thead><tr style="background:' + theme.headerTint + ';">' +
      '<th style="width:16%;">Teacher</th><th style="width:14%;min-width:90px;">ID</th><th style="width:24%;min-width:180px;">Subject &amp; Classes</th><th style="width:16%;min-width:120px;">Roles</th><th style="width:15%;">Contact Info</th><th style="width:9%;">Account access</th><th class="c-align-right" style="width:6%;">Actions</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</div>'
    );
  }

  function renderParentsPanel() {
    const theme = TAB_THEMES.Parents;
    const relationOptions = [{ label: 'All', value: 'all' }].concat(toFilterOptions(allParents().map(function (p) { return p.relation; })));
    const childOptions = [{ label: 'All', value: 'all' }].concat(toFilterOptions(allParents().reduce(function (acc, p) { return acc.concat(getChildClasses(p.children)); }, [])));

    const parents = allParents().filter(function (parent) {
      const q = State.parentQuery.trim().toLowerCase();
      const matchesSearch = !q || [parent.name, parent.id, parent.email].concat(parent.children).join(' ').toLowerCase().indexOf(q) !== -1;
      const matchesRelation = State.parentRelation === 'all' || parent.relation === State.parentRelation;
      const matchesChild = State.parentChildClass === 'all' || getChildClasses(parent.children).indexOf(State.parentChildClass) !== -1;
      return matchesSearch && matchesRelation && matchesChild;
    });

    let rows = '';
    if (parents.length) {
      parents.forEach(function (parent) {
        const details = getPersonDetails(parent.id, parent);
        const status = getAccountStatus(parent.id, parent.status);
        rows +=
          '<tr class="' + theme.rowHover + '">' +
          '<td><div class="c-person-cell"><div class="c-avatar c-avatar-md ' + (parent.tone || '') + '">' + esc(parent.initials) + '</div>' +
          '<div><span style="font-weight:600;font-size:0.875rem;color:var(--midnight); display:block;">' + esc(details.name) + '</span>' +
          '<p class="c-subtext">' + esc(parent.relation) + '</p></div></div></td>' +
          '<td style="font-size:0.75rem;font-weight:700;">' + esc(parent.id) + '</td>' +
          '<td><div style="display:flex;flex-direction:column;gap:0.375rem;">' + parent.children.map(function (child) {
            const match = child.match(/—\s*(\d+)-/);
            const gradeStr = match ? match[1] : '';
            let style = 'background:rgba(175,80,49,0.15);color:var(--color-terracotta);';
            if (gradeStr === '6') style = 'background:rgba(234,137,19,0.2);color:var(--color-sunshine);';
            else if (gradeStr === '7') style = 'background:rgba(127,199,204,0.3);color:var(--color-skyblue);';
            else if (gradeStr === '8') style = 'background:rgba(164,171,152,0.3);color:var(--color-moss);';
            else if (gradeStr === '9') style = 'background:rgba(15,65,74,0.15);color:var(--color-midnight);';
            else if (gradeStr === '10' || gradeStr === '11') style = 'background:rgba(127,3,3,0.1);color:var(--color-maroon);';
            return '<button type="button" class="c-tag-chip j-open-linked-student" style="' + style + '" data-link="' + esc(child) + '">' + esc(child) + '</button>';
          }).join('') + '</div></td>' +
          '<td class="c-stack-tight"><span class="c-contact-line">' + icon('mail', 12, 'c-icon-muted') + esc(details.email || 'Not recorded') + '</span><span class="c-contact-line">' + icon('phone', 12, 'c-icon-muted') + esc(details.phone || 'Not recorded') + '</span></td>' +
          '<td>' + queueMount('select', {
            value: status, options: ['Active', 'Deactivated'], tone: 'terracotta', ariaLabel: 'Account status for ' + parent.name,
            onChange: function (v) { updateAccountStatus(parent.id, parent.name, v); }
          }) + '</td>' +
          '<td class="c-align-right"><div class="c-row-actions">' +
          '<button type="button" class="c-row-action-btn j-open-profile" data-role="parent" data-id="' + esc(parent.id) + '">' + icon('eye', 14) + '<span class="c-row-action-label">View</span></button>' +
          '<button type="button" class="c-row-action-btn j-edit-profile" data-role="parent" data-id="' + esc(parent.id) + '">' + icon('pencilLine', 14) + '<span class="c-row-action-label">Edit</span></button>' +
          '</div></td>' +
          '</tr>';
      });
    } else {
      rows = '<tr class="c-empty-row"><td colspan="6"><p class="c-empty-title">No parents match these filters.</p><p class="c-empty-desc">Try a different search term or clear the filters.</p><button type="button" class="c-empty-clear j-clear-parent-filters">Clear filters</button></td></tr>';
    }

    return (
      '<div class="c-panel">' +
      '<div class="c-panel-toolbar" style="background:' + theme.tint + ';">' +
      '<div class="c-panel-toolbar-row c-wrap-row">' +
      searchFieldHtml('j-parent-search', 'Search parents...', State.parentQuery) +
      queueMount('filterselect', { label: 'Relationship', ariaLabel: 'Filter parents by relationship', tone: 'terracotta', value: State.parentRelation, options: relationOptions, onChange: function (v) { State.parentRelation = v; renderDirectoryPage(); } }) +
      queueMount('filterselect', { label: 'Child class', ariaLabel: 'Filter parents by linked child class', tone: 'terracotta', value: State.parentChildClass, options: childOptions, onChange: function (v) { State.parentChildClass = v; renderDirectoryPage(); } }) +
      (State.parentQuery || State.parentRelation !== 'all' || State.parentChildClass !== 'all' ? '<button type="button" class="c-clear-btn j-clear-parent-filters">Clear</button>' : '') +
      '<button type="button" class="c-btn-accent ' + theme.accentClass + ' j-nav-link" style="margin-left:auto;" data-j-route="add-parent">' + icon('userPlus', 15) + 'Add Parent</button>' +
      '</div>' +
      '</div>' +
      '<div class="c-result-summary">' + parents.length + ' parent account' + (parents.length === 1 ? '' : 's') + ' found</div>' +
      '<div class="c-table-scroll"><table class="c-table"><thead><tr style="background:' + theme.headerTint + ';">' +
      '<th>Parent</th><th>ID</th><th>Linked Students</th><th>Contact Info</th><th>Account access</th><th class="c-align-right">Actions</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</div>'
    );
  }

  function renderManagementPanel() {
    const theme = TAB_THEMES['Management Panel'];
    const members = allManagement().filter(function (member) {
      const q = State.managementQuery.trim().toLowerCase();
      return !q || [member.name, member.id, member.email, member.jobTitle].join(' ').toLowerCase().indexOf(q) !== -1;
    });

    let rows = '';
    if (members.length) {
      members.forEach(function (member) {
        const details = getPersonDetails(member.id, member);
        const status = getAccountStatus(member.id, member.status);
        rows +=
          '<tr class="' + theme.rowHover + '">' +
          '<td><div class="c-person-cell"><div class="c-avatar c-avatar-md ' + (member.tone || '') + '">' + esc(member.initials) + '</div>' +
          '<span style="font-weight:600;font-size:0.875rem;color:var(--midnight);">' + esc(details.name) + '</span></div></td>' +
          '<td style="font-size:0.75rem;font-weight:700;">' + esc(member.id) + '</td>' +
          '<td class="c-stack-tight"><span class="c-contact-line">' + icon('mail', 12, 'c-icon-muted') + esc(details.email || 'Not recorded') + '</span><span class="c-contact-line">' + icon('phone', 12, 'c-icon-muted') + esc(details.phone || 'Not recorded') + '</span></td>' +
          '<td>' + queueMount('select', {
            value: status, options: ['Active', 'Deactivated'], tone: 'maroon', ariaLabel: 'Account status for ' + member.name,
            onChange: function (v) { updateAccountStatus(member.id, member.name, v); }
          }) + '</td>' +
          '<td class="c-align-right"><div class="c-row-actions">' +
          '<button type="button" class="c-row-action-btn j-open-profile" data-role="management" data-id="' + esc(member.id) + '">' + icon('eye', 14) + '<span class="c-row-action-label">View</span></button>' +
          '<button type="button" class="c-row-action-btn j-edit-profile" data-role="management" data-id="' + esc(member.id) + '">' + icon('pencilLine', 14) + '<span class="c-row-action-label">Edit</span></button>' +
          '</div></td>' +
          '</tr>';
      });
    } else {
      rows = '<tr class="c-empty-row"><td colspan="6"><p class="c-empty-title">No staff match these filters.</p><p class="c-empty-desc">Try a different search term or clear the filters.</p><button type="button" class="c-empty-clear j-clear-management-filters">Clear filters</button></td></tr>';
    }

    return (
      '<div class="c-panel">' +
      '<div class="c-panel-toolbar" style="background:' + theme.tint + ';">' +
      '<div class="c-panel-toolbar-row c-wrap-row">' +
      searchFieldHtml('j-management-search', 'Search management...', State.managementQuery) +
      (State.managementQuery ? '<button type="button" class="c-clear-btn j-clear-management-filters">Clear</button>' : '') +
      '<button type="button" class="c-btn-accent ' + theme.accentClass + ' j-nav-link" style="margin-left:auto;" data-j-route="add-management">' + icon('plus', 15) + 'Add Staff</button>' +
      '</div>' +
      '</div>' +
      '<div class="c-result-summary">' + members.length + ' staff member' + (members.length === 1 ? '' : 's') + ' found</div>' +
      '<div class="c-table-scroll"><table class="c-table"><thead><tr style="background:' + theme.headerTint + ';">' +
      '<th>Staff Member</th><th>ID</th><th>Contact Info</th><th>Account access</th><th class="c-align-right">Actions</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</div>'
    );
  }

  function findProfileByRoleId(role, id) {
    if (role === 'student') { const s = allStudents().find(function (x) { return x.index === id; }); return s && toStudentProfile(s); }
    if (role === 'teacher') { const t = allTeachers().find(function (x) { return x.id === id; }); return t && toTeacherProfile(t); }
    if (role === 'parent') { const p = allParents().find(function (x) { return x.id === id; }); return p && toParentProfile(p); }
    if (role === 'management') { const m = allManagement().find(function (x) { return x.id === id; }); return m && toManagementProfile(m); }
    return null;
  }

  function wireDirectoryPanelEvents(tab) {
    const host = document.getElementById('j-directory-panel-host');

    qsa('.j-nav-link', host).forEach(function (el) { el.addEventListener('click', function () { navigate(el.getAttribute('data-j-route')); }); });
    qsa('.j-open-profile', host).forEach(function (el) {
      el.addEventListener('click', function () {
        const profile = findProfileByRoleId(el.getAttribute('data-role'), el.getAttribute('data-id'));
        if (profile) openProfile(profile, 'view');
      });
    });
    qsa('.j-edit-profile', host).forEach(function (el) {
      el.addEventListener('click', function () {
        const profile = findProfileByRoleId(el.getAttribute('data-role'), el.getAttribute('data-id'));
        if (profile) openProfile(profile, 'edit');
      });
    });
    qsa('.j-open-linked-student', host).forEach(function (el) {
      el.addEventListener('click', function () {
        openProfile(getStudentProfileFromLink(el.getAttribute('data-link')), 'view');
      });
    });
    qsa('.j-context-card', host).forEach(function (el) {
      el.addEventListener('click', function () {
        const context = CLASS_ACADEMIC_CONTEXT[State.activeClass] || {};
        const teacher = allTeachers().find(function (t) { return t.name === context.classTeacher; });
        if (teacher) openProfile(toTeacherProfile(teacher), 'view');
      });
    });

    if (tab === 'Students') {
      qsa('.j-select-class', host).forEach(function (el) { el.addEventListener('click', function () { State.activeClass = el.getAttribute('data-class'); renderDirectoryPage(); }); });
      wireSearchInput(host, '.j-student-search', function (v) { State.studentQuery = v; });
      qsa('.j-clear-student-filters', host).forEach(function (el) { el.addEventListener('click', function () { State.studentQuery = ''; State.studentActivity = 'all'; renderDirectoryPage(); }); });
    } else if (tab === 'Teachers') {
      wireSearchInput(host, '.j-teacher-search', function (v) { State.teacherQuery = v; });
      qsa('.j-clear-teacher-filters', host).forEach(function (el) { el.addEventListener('click', function () { State.teacherQuery = ''; State.teacherSubjectsSelected = []; State.teacherClassesSelected = []; State.teacherTicsSelected = []; renderDirectoryPage(); }); });
    } else if (tab === 'Parents') {
      wireSearchInput(host, '.j-parent-search', function (v) { State.parentQuery = v; });
      qsa('.j-clear-parent-filters', host).forEach(function (el) { el.addEventListener('click', function () { State.parentQuery = ''; State.parentRelation = 'all'; State.parentChildClass = 'all'; renderDirectoryPage(); }); });
    } else {
      wireSearchInput(host, '.j-management-search', function (v) { State.managementQuery = v; });
      qsa('.j-clear-management-filters', host).forEach(function (el) { el.addEventListener('click', function () { State.managementQuery = ''; renderDirectoryPage(); }); });
    }
  }

  /**
   * Wires a search <input> so typing updates state + re-renders the panel,
   * while keeping keyboard focus and the caret position across the
   * innerHTML replacement (otherwise every keystroke would blur the field).
   */
  function wireSearchInput(host, selector, onValue) {
    const input = qs(selector, host);
    if (!input) return;
    input.addEventListener('input', function () {
      const value = input.value;
      const caret = input.selectionStart;
      onValue(value);
      renderDirectoryPage();
      const fresh = qs(selector, document.getElementById('j-directory-panel-host'));
      if (fresh) {
        fresh.focus();
        try { fresh.setSelectionRange(caret, caret); } catch (e) { }
      }
    });
  }

  /* =====================================================================
     14. PROFILE MODAL (view + edit)
     Mirrors src/components/DirectoryProfileModal.tsx and
     src/components/DigitalRecordBook.tsx.
     ===================================================================== */
  const ROLE_THEMES = {
    student: { tone: 'sky', label: 'Student profile', panelBg: 'rgba(127,199,204,0.35)', pillBg: 'rgba(127,199,204,0.2)', pillColor: 'var(--color-midnight)', softBg: 'var(--theme-student-bg)', borderColor: 'rgba(127,199,204,0.45)' },
    teacher: { tone: 'sunshine', label: 'Teaching staff profile', panelBg: 'rgba(234,137,19,0.12)', pillBg: 'rgba(234,137,19,0.2)', pillColor: 'var(--color-midnight)', softBg: 'rgba(234,137,19,0.1)', borderColor: 'rgba(234,137,19,0.5)' },
    parent: { tone: 'terracotta', label: 'Parent / guardian profile', panelBg: 'rgba(175,80,49,0.1)', pillBg: 'rgba(175,80,49,0.15)', pillColor: 'var(--color-terracotta)', softBg: 'rgba(175,80,49,0.1)', borderColor: 'rgba(175,80,49,0.45)' },
    management: { tone: 'maroon', label: 'Management profile', panelBg: 'rgba(127,3,3,0.1)', pillBg: 'rgba(127,3,3,0.1)', pillColor: 'var(--color-maroon)', softBg: 'rgba(127,3,3,0.08)', borderColor: 'rgba(127,3,3,0.4)' }
  };
  const PROVINCE_OPTIONS = ['Central', 'Eastern', 'North Central', 'Northern', 'North Western', 'Sabaragamuwa', 'Southern', 'Uva', 'Western'];
  const DISTRICT_OPTIONS = ['Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'];
  const ZONE_OPTIONS = ['Colombo Zone 1', 'Colombo Zone 2', 'Colombo Zone 3', 'Dehiwala', 'Gampaha', 'Homagama', 'Kotte', 'Maharagama', 'Nugegoda', 'Sri Jayawardenepura', 'Wattala'];
  const STUDENT_SUBTABS = [{ id: 'information', label: 'Information' }, { id: 'academics', label: 'Academics' }, { id: 'extracurriculars', label: 'Extracurriculars' }, { id: 'achievements', label: 'Achievements' }];

  function openProfile(profile, mode) {
    State.profileModal = { mode: mode || 'view', profile: prepareProfile(profile) };
    State.profileDraft = mode === 'edit' ? cloneProfile(State.profileModal.profile) : null;
    State.profileNameError = '';
    State.profileActiveSubTab = 'information';
    renderProfileModal();
    document.addEventListener('keydown', onProfileModalKeydown);
  }
  function prepareProfile(profile) {
    const override = State.profileOverrides[profile.id];
    const resolved = override || profile;
    return Object.assign({}, resolved, { status: getAccountStatus(profile.id, resolved.status === 'Deactivated' ? 'Deactivated' : 'Active') });
  }
  function closeProfile() {
    State.profileModal = null;
    State.profileDraft = null;
    document.getElementById('j-modal-root').innerHTML = '';
    document.removeEventListener('keydown', onProfileModalKeydown);
  }
  function onProfileModalKeydown(e) {
    if (e.key !== 'Escape') return;
    if (document.querySelector('.c-select-menu, .c-filter-panel, .c-dp-calendar')) return; // let open menus close first
    closeProfile();
  }
  function saveProfile() {
    const draft = State.profileDraft;
    if (!draft.name.trim()) { State.profileNameError = 'Full name is required.'; renderProfileModal(); return; }
    const saved = Object.assign({}, draft, { name: draft.name.trim() });

    // Auto-combine Management emergencyContact and officeLocation
    if (saved.management) {
      const emName = saved.management.emergencyName || (saved.management.emergencyContact || '').split(' · ')[0] || '';
      const emPhone = saved.management.emergencyPhone || (saved.management.emergencyContact || '').split(' · ')[1] || '';
      if (emName || emPhone) {
        saved.management.emergencyContact = emName + ' · ' + emPhone;
      }
      if (saved.management.officeAddress) {
        saved.management.officeLocation = saved.management.officeAddress;
      }
    }

    const status = saved.status === 'Deactivated' ? 'Deactivated' : 'Active';
    State.profileOverrides[saved.id] = saved;
    State.accountStatusOverrides[saved.id] = status;
    State.directoryFeedback = status === 'Deactivated' ? '' : (saved.name + "'s profile has been updated.");
    closeProfile();
    renderDirectoryPage();
  }
  function updateDraft(mutator) { State.profileDraft = mutator(State.profileDraft); renderProfileModal(); }
  function updateDraftPath(path, value) { updateDraft(function (current) { return setProfileValue(current, path, value); }); }

  function renderProfileModal() {
    const modal = State.profileModal;
    const root = document.getElementById('j-modal-root');
    if (!modal) { root.innerHTML = ''; return; }
    const isEditing = modal.mode === 'edit';
    const active = isEditing ? State.profileDraft : modal.profile;
    const theme = ROLE_THEMES[active.role];
    const statusClass = active.status === 'Active' ? 'c-status-active' : (active.status === 'On Leave' ? '' : 'c-status-inactive');

    let html =
      '<div class="c-modal-overlay" data-directory-profile-modal="true">' +
      '<button type="button" class="c-modal-scrim j-modal-close" aria-label="Close profile"></button>' +
      '<form class="c-modal-card" id="j-profile-form" role="dialog" aria-modal="true">' +
      '<header class="c-modal-header" style="background:' + theme.panelBg + ';">' +
      '<div class="c-modal-header-row">' +
      '<div class="c-modal-identity">' +
      '<div class="c-modal-avatar ' + (active.avatarTone || '') + '">' + esc(active.initials) + '</div>' +
      '<div style="min-width:0;">' +
      '<p class="c-modal-eyebrow">' + (isEditing ? 'Edit ' + theme.label.toLowerCase() : theme.label) + '</p>' +
      (isEditing
        ? '<input class="c-modal-name-input j-profile-name" value="' + esc(active.name) + '" />'
        : '<h2 class="c-modal-name c-font-display">' + esc(active.name) + '</h2>') +
      (State.profileNameError ? '<p class="j-profile-name-error" style="margin-top:0.25rem;font-size:0.75rem;font-weight:600;color:var(--color-maroon);">' + esc(State.profileNameError) + '</p>' : '') +
      '<p class="c-modal-subtitle">' + esc(active.subtitle) + '</p>' +
      '</div>' +
      '</div>' +
      '<button type="button" class="c-modal-close j-modal-close" aria-label="' + (isEditing ? 'Cancel profile editing' : 'Close profile') + '">' + icon('x', 20) + '</button>' +
      '</div>' +
      '<div class="c-modal-meta-row">' +
      '<span class="c-id-pill" style="background:' + theme.pillBg + ';color:' + theme.pillColor + ';">' + esc(active.id) + '</span>' +
      (isEditing
        ? queueMount('select', { value: active.status, options: ['Active', 'Deactivated'], tone: theme.tone, ariaLabel: 'Account status', className: '[min-width:8rem]', onChange: function (v) { updateDraftPath('status', v); } })
        : '<span class="c-status-pill ' + statusClass + '">' + esc(active.status) + '</span>') +
      (active.isKnown === false ? '<span class="c-status-pill c-status-unknown-pill">Directory record unavailable</span>' : '') +
      '</div>' +
      '</header>' +
      '<div class="c-modal-body">' +
      (active.isKnown === false ? '<div class="c-record-alert">This person is referenced in the directory but does not have a full current-year record. Available details are shown below.</div>' : '') +
      (active.role === 'student' && active.student ? renderStudentProfileSection(active, isEditing, theme)
        : isEditing ? renderEditableProfileSections(active, theme)
          : renderReadOnlyProfileSections(active, theme)) +
      '</div>' +
      (isEditing
        ? '<footer class="c-modal-footer"><button type="button" class="c-btn-ghost j-modal-close">Cancel</button><button type="submit" class="c-btn-dark">' + icon('checkCircle2', 16) + ' Save changes</button></footer>'
        : '') +
      '</form>' +
      '</div>';

    root.innerHTML = html;
    flushMounts();
    wireProfileModalEvents(isEditing);
  }

  function sectionTitleHtml(iconName, title) {
    return '<div class="c-section-title-row"><span class="c-icon-accent">' + icon(iconName, 16) + '</span><h3 class="c-section-title">' + esc(title) + '</h3></div>';
  }
  function infoCardHtml(opts) {
    // opts: { label, value, icon, editable, kind: 'text'|'select'|'date'|'email'|'tel', options, onChange, tone }
    let control;
    if (!opts.editable) {
      control = '<p class="c-info-card-value">' + esc(opts.value || 'Not recorded') + '</p>';
    } else if (opts.kind === 'select') {
      control = '<div style="margin-top:0.375rem;">' + queueMount('select', { value: opts.value || '', options: withCurrentOption(opts.options || [], opts.value), tone: opts.tone || 'sky', placeholder: 'Select ' + opts.label.toLowerCase(), ariaLabel: opts.label, onChange: opts.onChange }) + '</div>';
    } else if (opts.kind === 'date') {
      control = '<div style="margin-top:0.375rem;">' + queueMount('datepicker', { value: opts.value || '', tone: opts.tone || 'sky', ariaLabel: opts.label, onChange: opts.onChange }) + '</div>';
    } else {
      control = '<input class="c-info-card-input j-bound-input" data-bind="' + esc(opts.bind) + '" type="' + (opts.kind || 'text') + '" value="' + esc(opts.value || '') + '" aria-label="' + esc(opts.label) + '" />';
    }
    return '<div class="c-info-card"><p class="c-info-card-label">' + (opts.icon ? icon(opts.icon, 15) : '') + esc(opts.label) + '</p>' + control + '</div>';
  }

  function renderReadOnlyProfileSections(profile, theme) {
    let body = '';
    if (profile.role === 'teacher') {
      body += '<section>' + sectionTitleHtml('users', 'Contact & account') + '<div class="c-info-grid" style="margin-top:0.75rem;">' +
        infoCardHtml({ label: 'Reg. Number', value: profile.id || profile.index }) +
        infoCardHtml({ label: 'Institutional mail', value: profile.email, icon: 'mail' }) +
        infoCardHtml({ label: 'Personal mail', value: (profile.teacher || {}).personalEmail || 'Not provided', icon: 'mail' }) +
        infoCardHtml({ label: 'Mobile number', value: profile.phone, icon: 'phone' }) +
        '</div></section>';
    } else if (profile.role === 'parent') {
      body += '<section>' + sectionTitleHtml('users', 'Contact & account') + '<div class="c-info-grid" style="margin-top:0.75rem;">' +
        infoCardHtml({ label: 'Reg. Number', value: profile.id || profile.index }) +
        infoCardHtml({ label: 'Email', value: profile.email, icon: 'mail' }) +
        infoCardHtml({ label: 'Mobile number', value: profile.phone, icon: 'phone' }) +
        infoCardHtml({ label: 'Home number', value: (profile.parent || {}).secondaryContact, icon: 'phone' }) +
        '</div></section>';
    } else if (profile.role === 'management') {
      body += '<section>' + sectionTitleHtml('users', 'Contact & account') + '<div class="c-info-grid" style="margin-top:0.75rem;">' +
        infoCardHtml({ label: 'Reg. Number', value: profile.id || profile.index }) +
        infoCardHtml({ label: 'Institutional mail', value: profile.email, icon: 'mail' }) +
        infoCardHtml({ label: 'Mobile number', value: profile.phone, icon: 'phone' }) +
        '</div></section>';
    }
    if (profile.role === 'teacher') body += renderTeacherProfileSection(profile, theme);
    if (profile.role === 'parent') body += renderParentProfileSection(profile, theme);
    if (profile.role === 'management') body += renderManagementProfileSection(profile);
    return body;
  }

  function parseEmergency(str, nameVal, phoneVal) {
    if (nameVal || phoneVal) return { name: nameVal || 'Not recorded', phone: phoneVal || 'Not recorded' };
    if (!str) return { name: 'Not recorded', phone: 'Not recorded' };
    const parts = str.split('·').map(s => s.trim());
    if (parts.length >= 2) return { name: parts[0], phone: parts[1] };
    const parts2 = str.split(' - ').map(s => s.trim());
    if (parts2.length >= 2) return { name: parts2[0], phone: parts2[1] };
    return { name: str, phone: 'Not recorded' };
  }

  function renderTeacherProfileSection(profile, theme) {
    const teacher = profile.teacher || {};
    let assignments = '';
    if (teacher.subjectAssignments && teacher.subjectAssignments.length) {
      assignments = '<div class="c-assignment-grid">' + teacher.subjectAssignments.map(function (a) {
        return '<div class="c-assignment-row"><span class="c-assignment-subject">' + esc(a.subject) + '</span><span class="c-assignment-pill" style="background:' + theme.pillBg + ';color:' + theme.pillColor + ';">Class ' + esc(a.className) + '</span></div>';
      }).join('') + '</div>';
    } else assignments = '<div class="c-empty-state">No subject-to-class assignments have been recorded.</div>';

    const emergency = parseEmergency(teacher.emergencyContact, teacher.emergencyName, teacher.emergencyPhone);

    return (
      '<section>' + sectionTitleHtml('bookOpen', 'Class teacher responsibility') + '<div class="c-info-grid" style="margin-top:0.75rem;">' +
      infoCardHtml({ label: 'Class Teacher Role', value: teacher.classTeacherOf ? ('Class Teacher — In charge of ' + teacher.classTeacherOf) : 'Class Teacher (No class assigned)' }) +
      infoCardHtml({ label: 'TIC responsibility', value: teacher.tic || 'Not assigned' }) + '</div></section>' +
      '<section>' + sectionTitleHtml('mapPin', 'Personal & employment') + '<div class="c-info-grid c-cols-3" style="margin-top:0.75rem;">' +
      infoCardHtml({ label: 'Full name', value: profile.fullName || (profile.firstName + ' ' + profile.lastName) }) +
      infoCardHtml({ label: 'NIC', value: teacher.nic || 'Not recorded' }) +
      infoCardHtml({ label: 'Date of birth', value: teacher.dateOfBirth || 'Not recorded' }) +
      infoCardHtml({ label: 'Personal email', value: teacher.personalEmail || 'Not recorded' }) +
      infoCardHtml({ label: 'Experience (years)', value: (teacher.experience || '0') + ' years' }) +
      infoCardHtml({ label: 'Join date', value: teacher.joinDate || 'Not recorded' }) +
      '</div></section>' +
      '<section>' + sectionTitleHtml('phone', 'Emergency contact details') + '<div class="c-info-grid c-cols-2" style="margin-top:0.75rem;">' +
      infoCardHtml({ label: 'Emergency Contact Name', value: emergency.name || 'Not recorded' }) +
      infoCardHtml({ label: 'Emergency Contact Number', value: emergency.phone || 'Not recorded' }) +
      '</div></section>' +
      '<section class="c-tinted-section c-tint-' + theme.tone + '">' + sectionTitleHtml('calendarDays', 'Subject teaching assignments') + assignments +
      '<p class="c-workload-note">' + esc(teacher.workload || 'Teaching workload not recorded.') + '</p></section>' +
      '<section>' + sectionTitleHtml('graduationCap', 'Qualifications & Experience') + '<div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.75rem;">' +
      (teacher.qualifications && teacher.qualifications.length ? teacher.qualifications.map(q =>
        '<div style="background:var(--color-alabaster);padding:0.75rem 1rem;border-radius:0.5rem;">' +
        '<div style="font-weight:500;color:var(--color-midnight);">' + esc(q.title || 'Untitled Qualification') + '</div>' +
        '<div style="font-size:0.875rem;color:var(--color-slate);margin-top:0.25rem;">' + esc(q.institution) + (q.year ? ' • ' + esc(q.year) : '') + '</div>' +
        '</div>'
      ).join('') : '<div class="c-empty-state">No qualifications recorded.</div>') +
      '</div></section>'
    );
  }
  function renderParentProfileSection(profile, theme) {
    const parent = profile.parent || {};
    let linked = '';
    if (parent.linkedStudents && parent.linkedStudents.length) {
      linked = '<div class="c-linked-grid">' + parent.linkedStudents.map(function (s) {
        return '<button type="button" class="c-linked-btn j-open-linked-student-id" data-id="' + esc(s.id) + '"><span class="c-linked-left">' + icon('checkCircle2', 15) + '<span class="c-linked-name">' + esc(s.name) + '</span></span><span class="c-assignment-pill" style="background:' + theme.pillBg + ';color:' + theme.pillColor + ';">' + esc(s.className) + '</span></button>';
      }).join('') + '</div>';
    } else linked = '<div class="c-empty-state">No linked student accounts are recorded.</div>';
    return (
      '<section>' + sectionTitleHtml('users', 'Personal details') + '<div class="c-info-grid c-cols-3" style="margin-top:0.75rem;">' +
      infoCardHtml({ label: 'Full name', value: profile.fullName || (profile.firstName + ' ' + profile.lastName) }) + infoCardHtml({ label: 'Relationship', value: parent.relationship }) + infoCardHtml({ label: 'NIC', value: parent.identityReference }) +
      infoCardHtml({ label: 'Passport', value: parent.passport }) + infoCardHtml({ label: 'Date of birth', value: parent.dateOfBirth }) +
      infoCardHtml({ label: 'Emergency name', value: parent.emergencyName }) + infoCardHtml({ label: 'Emergency contact', value: parent.emergencyContact }) + '</div></section>' +
      '<section>' + sectionTitleHtml('userCheck', 'Enrollment details') + '<div class="c-info-grid c-cols-3" style="margin-top:0.75rem;">' +
      infoCardHtml({ label: 'Occupation', value: parent.occupation }) + infoCardHtml({ label: 'Employer / workplace', value: parent.employer }) +
      infoCardHtml({ label: 'Office contact number', value: parent.officePhone }) + infoCardHtml({ label: 'Office address', value: parent.officeAddress }) + infoCardHtml({ label: 'Residential address', value: parent.homeAddress }) + '</div></section>' +
      '<section class="c-tinted-section c-tint-' + theme.tone + '">' + sectionTitleHtml('graduationCap', 'Linked student accounts') + linked + '</section>'
    );
  }
  function renderManagementProfileSection(profile) {
    const mgmt = profile.management || {};
    return (
      '<section>' + sectionTitleHtml('userCheck', 'Employment') + '<div class="c-info-grid" style="margin-top:0.75rem;">' +
      infoCardHtml({ label: 'Joining date', value: mgmt.joiningDate }) + infoCardHtml({ label: 'Office address', value: mgmt.officeAddress }) + '</div></section>' +
      '<section>' + sectionTitleHtml('mapPin', 'Personal information') + '<div class="c-info-grid" style="margin-top:0.75rem;">' +
      infoCardHtml({ label: 'Full name', value: profile.fullName || (profile.firstName + ' ' + profile.lastName) }) + infoCardHtml({ label: 'NIC', value: mgmt.nic }) + infoCardHtml({ label: 'Personal email', value: mgmt.personalEmail }) +
      infoCardHtml({ label: 'Residential address', value: mgmt.personalAddress }) +
      '</div></section>' +
      '<section>' + sectionTitleHtml('users', 'Emergency account') + '<div class="c-info-grid" style="margin-top:0.75rem;">' +
      infoCardHtml({ label: 'Emergency name', value: (mgmt.emergencyContact || '').split(' · ')[0] || 'Not recorded' }) +
      infoCardHtml({ label: 'Emergency contact', value: (mgmt.emergencyContact || '').split(' · ')[1] || 'Not recorded' }) +
      '</div></section>'
    );
  }

  /* ---- Student profile (view + edit share the same sub-tab shell) ---- */
  function renderStudentProfileSection(profile, isEditing, theme) {
    const student = profile.student || {};
    const tabsHtml = '<div class="c-subtab-list" role="tablist">' + STUDENT_SUBTABS.map(function (tab) {
      const isActive = State.profileActiveSubTab === tab.id;
      return '<button type="button" role="tab" class="c-subtab-btn j-student-subtab ' + (isActive ? 'is-active-subtab' : '') + '" data-tab="' + tab.id + '">' +
        (isActive ? '<span class="c-subtab-underline"></span>' : '') + '<span style="position:relative;">' + esc(tab.label) + '</span></button>';
    }).join('') + '</div>';

    let panel = '';
    const tab = State.profileActiveSubTab;
    if (tab === 'information') panel = renderStudentInformationTab(profile, student, isEditing, theme);
    else if (tab === 'academics') panel = renderStudentAcademicsTab(profile, student, isEditing);
    else if (tab === 'extracurriculars') panel = renderStudentExtracurricularsTab(student, isEditing, theme);
    else panel = renderStudentAchievementsTab(student, isEditing);

    return '<section aria-label="Student profile details">' + tabsHtml + '<div class="c-subtab-panel">' + panel + '</div></section>';
  }

  function renderStudentInformationTab(profile, student, isEditing, theme) {
    const personal = student.personal || {};
    const residential = student.residential || {};
    const studentClassOptions = withCurrentOption(classOptionsForGrade(student.grade), student.className);
    let html =
      '<section>' + sectionTitleHtml('users', 'Account') + '<div class="c-info-grid" style="margin-top:0.75rem;">' +
      infoCardHtml({ label: 'Reg. Number', value: profile.id || profile.index || student.index }) +
      infoCardHtml({ label: 'Student email', value: profile.email, icon: 'mail', editable: isEditing, kind: 'email', bind: 'email' }) +
      '</div></section>' +
      '<section>' + sectionTitleHtml('userCheck', 'Student information') + '<div class="c-info-grid c-cols-4" style="margin-top:0.75rem;">' +
      infoCardHtml({ label: 'Grade', value: student.grade, editable: isEditing, kind: 'select', tone: 'sky', options: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11'], onChange: function (v) { updateDraftPath('student.grade', v); } }) +
      infoCardHtml({ label: 'Class / section', value: student.className, editable: isEditing, kind: 'select', tone: 'sky', options: studentClassOptions, onChange: function (v) { updateDraftPath('student.className', v); } }) +

      infoCardHtml({ label: 'Birth certificate no.', value: personal.birthCertificateNumber, editable: isEditing, bind: 'student.personal.birthCertificateNumber' }) +
      infoCardHtml({ label: 'Date of birth', value: personal.dateOfBirth, editable: isEditing, kind: 'date', tone: 'sky', onChange: function (v) { if (State.profileDraft) setProfileValue(State.profileDraft, 'student.personal.dateOfBirth', v); } }) +
      infoCardHtml({ label: 'Gender', value: personal.gender, editable: isEditing, kind: 'select', tone: 'sky', options: ['Female', 'Male', 'Prefer not to say'], onChange: function (v) { updateDraftPath('student.personal.gender', v); } }) +
      infoCardHtml({ label: 'Admission Date', value: personal.admissionDate, editable: isEditing, kind: 'date', tone: 'sky', onChange: function (v) { if (State.profileDraft) setProfileValue(State.profileDraft, 'student.personal.admissionDate', v); } }) +
      infoCardHtml({ label: 'Blood Group', value: personal.bloodGroup, editable: isEditing, kind: 'select', tone: 'sky', options: ['Not provided', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], onChange: function (v) { updateDraftPath('student.personal.bloodGroup', v); } }) +
      infoCardHtml({ label: 'Nationality', value: personal.nationality, editable: isEditing, bind: 'student.personal.nationality' }) +
      infoCardHtml({ label: 'Religion', value: personal.religion, editable: isEditing, kind: 'select', tone: 'sky', options: ['Buddhism', 'Christianity', 'Hinduism', 'Islam', 'Other', 'Prefer not to say'], onChange: function (v) { updateDraftPath('student.personal.religion', v); } }) +
      '</div></section>' +
      '<section>' + sectionTitleHtml('mapPin', 'Residential details') + '<div class="c-info-grid" style="margin-top:0.75rem;">' +
      infoCardHtml({ label: 'Residential address', value: residential.address, editable: isEditing, bind: 'student.residential.address' }) +
      infoCardHtml({ label: 'Educational zone', value: residential.educationalZone, editable: isEditing, kind: 'select', tone: 'sky', options: ZONE_OPTIONS, onChange: function (v) { updateDraftPath('student.residential.educationalZone', v); } }) +
      infoCardHtml({ label: 'District', value: residential.district, editable: isEditing, kind: 'select', tone: 'sky', options: DISTRICT_OPTIONS, onChange: function (v) { updateDraftPath('student.residential.district', v); } }) +
      infoCardHtml({ label: 'Province', value: residential.province, editable: isEditing, kind: 'select', tone: 'sky', options: PROVINCE_OPTIONS, onChange: function (v) { updateDraftPath('student.residential.province', v); } }) +
      '</div></section>' +
      '<section>' + sectionTitleHtml('shieldAlert', 'Medical Notes') + '<div class="c-info-grid" style="margin-top:0.75rem;">' +
      infoCardHtml({ label: 'Medical Conditions / Notes', value: personal.medicalNotes || student.medicalNotes || 'None', editable: isEditing, bind: 'student.personal.medicalNotes' }) +
      '</div></section>' +
      renderConnectedGuardianCard(student.guardian, isEditing, theme);
    return html;
  }

  function renderConnectedGuardianCard(guardian, isEditing, theme) {
    guardian = guardian || { isAvailable: false };
    let inner;
    if (guardian.isAvailable) {
      const relBlock = isEditing
        ? '<div style="margin-top:0.25rem;width:12rem;">' + queueMount('select', {
          value: guardian.relationship || '', options: withCurrentOption(['Father', 'Mother', 'Guardian'], guardian.relationship), tone: 'sky', placeholder: 'Select relationship', ariaLabel: 'Guardian relationship',
          onChange: function (v) { updateDraft(function (current) { const next = cloneProfile(current); next.student = next.student || {}; next.student.guardian = Object.assign({}, next.student.guardian, { isAvailable: true, relationship: v }); return next; }); }
        }) + '</div>'
        : '<p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:rgba(15,65,74,0.55);">' + esc(guardian.relationship || 'Parent / guardian') + ' · ' + esc(guardian.accountAccess || 'Account connected') + '</p>';
      inner =
        '<div class="c-guardian-card-wrap">' +
        '<div style="min-width:0;">' +
        '<div style="display:flex;align-items:center;gap:0.5rem;"><div class="c-avatar c-avatar-sm" style="width:2rem;height:2rem;font-size:10px;" data-tone-class="' + (guardian.avatarTone || 'bg-terracotta text-white') + '">' + esc(guardian.initials || 'PG') + '</div>' +
        '<div style="min-width:0;"><p style="font-size:0.875rem;font-weight:700;color:var(--color-midnight);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(guardian.name || '') + '</p>' + relBlock + '</div></div>' +
        '<div style="margin-top:0.75rem;display:grid;gap:0.25rem 1.25rem;font-size:0.75rem;color:rgba(15,65,74,0.7);grid-template-columns:1fr 1fr;">' +
        '<span class="c-contact-line">' + icon('mail', 13) + esc(guardian.email || 'Email not recorded') + '</span>' +
        '<span class="c-contact-line">' + icon('phone', 13) + esc(guardian.phone || 'Phone not recorded') + '</span>' +
        '</div>' +
        '</div>' +
        (guardian.id && guardian.isAvailable
          ? '<button type="button" class="c-btn-solid-tone c-tone-terracotta j-open-linked-student-id" data-id="' + esc(guardian.id) + '" style="flex-shrink:0;">Open parent account</button>'
          : '<span class="c-status-pill c-status-unknown-pill" style="width:fit-content;">Account unavailable</span>') +
        '</div>';
      inner = inner.replace(/data-tone-class="([^"]*)"/, function (m, cls) { return 'class="c-avatar c-avatar-sm ' + cls + '" style="width:2rem;height:2rem;font-size:10px;"'; });
    } else {
      inner = '<div class="c-guardian-empty"><p style="font-size:0.75rem;font-weight:600;color:rgba(15,65,74,0.7);">No connected parent or guardian account is available for this student.</p>' +
        '<p style="margin-top:0.25rem;font-size:11px;line-height:1.6;color:rgba(15,65,74,0.55);">A parent account can be linked when guardian enrollment details are confirmed.</p></div>';
    }
    return '<section class="c-tinted-section c-tint-' + theme.tone + '">' + sectionTitleHtml('users', 'Connected parent / guardian account') + inner + '</section>';
  }

  function renderStudentAcademicsTab(profile, student, isEditing) {
    const recordBook = student.recordBook || {};
    let editPanel = '';
    if (isEditing) {
      const prev = recordBook.previousSchool || {};
      editPanel =
        '<section class="c-tinted-section c-tint-sky">' +
        '<div class="c-section-title-row" style="margin-bottom:0.75rem;"><span class="c-icon-accent">' + icon('bookOpen', 16) + '</span><h3 class="c-section-title">Academic record details</h3></div>' +
        '<div class="c-info-grid">' +
        inlineEditFieldHtml('Previous school', prev.name, 'student.recordBook.previousSchool.name') +
        inlineEditSelectHtml('School type', prev.type, ['Government', 'Private', 'International', 'Semi-government'], function (v) { updateDraftPath('student.recordBook.previousSchool.type', v); }) +
        inlineEditFieldHtml('Completion year', prev.completionYear, 'student.recordBook.previousSchool.completionYear') +
        inlineEditFieldHtml('Class position', recordBook.classPosition, 'student.recordBook.classPosition') +
        inlineEditSelectHtml('Conduct grade', recordBook.conductGrade, ['Excellent', 'Very Good', 'Good', 'Satisfactory', 'Needs Improvement'], function (v) { updateDraftPath('student.recordBook.conductGrade', v); }) +
        '</div>' +
        renderAcademicDocumentEditor(recordBook.documents || []) +
        '</section>';
    }
    return editPanel + renderDigitalRecordBook(student, isEditing);
  }
  function inlineEditFieldHtml(label, value, bind) {
    return '<label><span style="margin-bottom:0.25rem;display:block;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:rgba(15,65,74,0.55);">' + esc(label) + '</span>' +
      '<input class="c-edit-input j-bound-input" style="padding:0.5rem 0.625rem;font-size:0.75rem;" data-bind="' + esc(bind) + '" value="' + esc(value || '') + '" /></label>';
  }
  function inlineEditSelectHtml(label, value, options, onChange) {
    return '<label><span style="margin-bottom:0.25rem;display:block;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:rgba(15,65,74,0.55);">' + esc(label) + '</span>' +
      queueMount('select', { value: value || '', options: withCurrentOption(options, value), tone: 'sky', placeholder: 'Select ' + label.toLowerCase(), ariaLabel: label, onChange: onChange }) + '</label>';
  }
  function renderAcademicDocumentEditor(documents) {
    if (!documents.length) return '';
    return '<div style="margin-top:1rem;border-top:1px solid rgba(127,199,204,0.2);padding-top:0.75rem;">' +
      '<p style="margin-bottom:0.5rem;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:rgba(15,65,74,0.55);">Document status</p>' +
      '<div class="c-info-grid">' + documents.map(function (doc, index) {
        return '<div style="display:flex;min-width:0;align-items:center;gap:0.5rem;border-radius:0.5rem;border:1px solid rgba(127,199,204,0.2);background:rgba(255,255,255,0.7);padding:0.5rem 0.625rem;">' +
          '<span style="min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:600;">' + esc(doc.name) + '</span>' +
          queueMount('select', {
            value: doc.status, options: ['Submitted', 'Verified', 'Pending'], tone: 'sky', placeholder: 'Status', ariaLabel: doc.name + ' status',
            onChange: function (status) { updateDraft(function (current) { const next = cloneProfile(current); const docs = (next.student.recordBook.documents || []).slice(); docs[index] = Object.assign({}, docs[index], { status: status }); next.student.recordBook.documents = docs; return next; }); }
          }) +
          '</div>';
      }).join('') + '</div></div>';
  }

  function renderStudentExtracurricularsTab(student, isEditing, theme) {
    const rows = student.extracurriculars || [];
    const addBtn = isEditing ? '<button type="button" class="c-list-editor-add j-add-extracurricular" style="border-color:rgba(127,199,204,0.45);background:rgba(127,199,204,0.1);">Add activity</button>' : '';
    let body;
    if (rows.length) {
      const getCardTheme = function (a) {
        if (!a) return { bg: theme.softBg, border: theme.borderColor };
        const n = a.toLowerCase();
        if (n.indexOf('debating') !== -1) return { bg: '#f4ebe1', border: 'rgba(15,65,74,0.2)' };
        if (n.indexOf('choir') !== -1) return { bg: 'rgba(127,199,204,0.15)', border: 'rgba(127,199,204,0.4)' };
        if (n.indexOf('robotics') !== -1) return { bg: 'rgba(234,137,19,0.15)', border: 'rgba(234,137,19,0.4)' };
        if (n.indexOf('swimming') !== -1) return { bg: 'rgba(150,192,206,0.15)', border: 'rgba(150,192,206,0.4)' };
        if (n.indexOf('science') !== -1) return { bg: 'rgba(164,171,152,0.15)', border: 'rgba(164,171,152,0.4)' };
        if (n.indexOf('football') !== -1) return { bg: 'rgba(175,80,49,0.1)', border: 'rgba(175,80,49,0.4)' };
        return { bg: theme.softBg, border: theme.borderColor };
      };
      body = '<div class="c-extra-grid">' + rows.map(function (activity, index) {
        const ct = getCardTheme(activity.name);
        if (isEditing) {
          return '<article class="c-extra-card" style="border-color:' + ct.border + ';background:' + ct.bg + ';">' +
            '<div style="display:flex;flex-direction:column;gap:0.5rem;">' +
            queueMount('select', {
              value: activity.name, options: withCurrentOption(['Debating Society', 'School Choir', 'Robotics & AI Lab', 'Swimming Team', 'Science Society', 'Junior Football Team', 'Chess Club', 'Drama Club'], activity.name), tone: 'sky', placeholder: 'Select activity', ariaLabel: 'Activity ' + (index + 1),
              onChange: function (v) { updateExtracurricular(index, 'name', v); }
            }) +
            '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:0.5rem;">' +
            queueMount('select', {
              value: activity.role || '', options: withCurrentOption(['Member', 'Captain', 'Team member', 'Junior speaker', 'Lead performer', 'Secretary', 'President'], activity.role), tone: 'sky', placeholder: 'Role', ariaLabel: 'Activity role',
              onChange: function (v) { updateExtracurricular(index, 'role', v); }
            }) +
            queueMount('select', {
              value: activity.status || '', options: ['Active', 'Inactive', 'Completed'], tone: 'sky', placeholder: 'Status', ariaLabel: 'Activity status',
              onChange: function (v) { updateExtracurricular(index, 'status', v); }
            }) +
            '<button type="button" class="c-list-editor-remove j-remove-extracurricular" data-index="' + index + '">Remove</button>' +
            '</div>' +
            '</div></article>';
        }
        return '<article class="c-extra-card" style="border-color:' + ct.border + ';background:' + ct.bg + ';"><p class="c-extra-title">' + esc(activity.name) + '</p><p class="c-extra-meta">' + esc([activity.role, activity.status].filter(Boolean).join(' · ') || 'Participation recorded') + '</p></article>';
      }).join('') + '</div>';
    } else {
      body = '<div class="c-empty-state">' + (isEditing ? 'Add an extracurricular activity to begin recording involvement.' : 'No extracurricular involvement has been recorded.') + '</div>';
    }
    return '<section><div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;">' + sectionTitleHtml('calendarDays', 'Extracurricular involvement') + addBtn + '</div>' + body + '</section>';
  }
  function updateExtracurricular(index, field, value) {
    updateDraft(function (current) {
      const next = cloneProfile(current);
      const list = (next.student.extracurriculars || []).slice();
      list[index] = Object.assign({}, list[index], {});
      list[index][field] = value;
      next.student.extracurriculars = list;
      return next;
    });
  }

  function renderStudentAchievementsTab(student, isEditing) {
    const achievements = student.achievements || [];
    let body;
    if (achievements.length) {
      body = '<div class="c-achievement-grid">' + achievements.map(function (a, index) {
        if (isEditing) {
          return '<article class="c-achievement-card"><div class="c-achievement-body"><div class="c-achievement-icon">' + icon('trophy', 16) + '</div><div style="min-width:0;flex:1;display:flex;flex-direction:column;gap:0.5rem;">' +
            '<input class="c-edit-input j-achievement-title" style="padding:0.375rem 0.5rem;font-size:0.75rem;font-weight:700;" data-index="' + index + '" value="' + esc(a.title) + '" />' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;">' +
            queueMount('select', {
              value: a.category, options: withCurrentOption(['Academic', 'Cultural', 'Sports', 'Technology', 'Leadership', 'Community Service'], a.category), tone: 'sky', placeholder: 'Category', ariaLabel: 'Achievement category',
              onChange: function (v) { updateAchievement(index, 'category', v); }
            }) +
            queueMount('select', {
              value: a.level || '', options: withCurrentOption(['Class', 'School', 'District', 'Provincial', 'National', 'Inter-school'], a.level), tone: 'sky', placeholder: 'Level', ariaLabel: 'Achievement level',
              onChange: function (v) { updateAchievement(index, 'level', v); }
            }) +
            '<input class="c-edit-input j-achievement-year" style="padding:0.375rem 0.5rem;font-size:10px;" data-index="' + index + '" value="' + esc(a.year || '') + '" />' +
            '</div></div></div></article>';
        }
        return '<article class="c-achievement-card"><div class="c-achievement-body"><div class="c-achievement-icon">' + icon('trophy', 16) + '</div><div><p class="c-achievement-title">' + esc(a.title) + '</p><p class="c-achievement-meta">' + esc([a.category, a.level, a.year].filter(Boolean).join(' · ')) + '</p></div></div></article>';
      }).join('') + '</div>';
    } else {
      body = '<div class="c-empty-state">No achievements have been recorded for this student.</div>';
    }
    return '<section>' + sectionTitleHtml('trophy', 'Achievements') + body + '</section>';
  }
  function updateAchievement(index, field, value, skipRender) {
    if (skipRender) {
      if (State.profileDraft) {
        State.profileDraft.student = State.profileDraft.student || {};
        State.profileDraft.student.achievements = State.profileDraft.student.achievements || [];
        if (State.profileDraft.student.achievements[index]) {
          State.profileDraft.student.achievements[index][field] = value;
        }
      }
    } else {
      updateDraft(function (current) {
        const next = cloneProfile(current);
        const list = (next.student.achievements || []).slice();
        list[index] = Object.assign({}, list[index]);
        list[index][field] = value;
        next.student.achievements = list;
        return next;
      });
    }
  }

  /* ---- Digital Record Book (mirrors DigitalRecordBook.tsx) ---- */
  const RECORDBOOK_GRADE_LEVELS = [6, 7, 8, 9, 10, 11, 12, 13];
  const RECORDBOOK_SUBJECTS = ['Sinhala', 'Tamil', 'English', 'English Language', 'Mathematics', 'Science', 'History', 'Geography', 'ICT', 'Information Tech', 'Arts', 'Music', 'Health & Physical Education', 'Religion'];
  let recordBookSelectedGrade = null;
  let recordBookSelectedTerm = 'Term 2';

  function renderDigitalRecordBook(student, isEditing) {
    const currentGradeNumber = Number((student.grade || 'Grade 9').match(/\d+/) ? (student.grade || 'Grade 9').match(/\d+/)[0] : 9);
    if (recordBookSelectedGrade === null) recordBookSelectedGrade = currentGradeNumber;
    const marks = student.recordBook && student.recordBook.marks;
    const rows = marks || [];
    const columnsClass = isEditing ? 'c-marks-cols-edit' : 'c-marks-cols-view';

    let gradeButtons = RECORDBOOK_GRADE_LEVELS.map(function (grade) {
      const isFuture = grade > currentGradeNumber;
      const isActive = recordBookSelectedGrade === grade;
      return '<button type="button" class="c-grade-btn j-recordbook-grade ' + (isActive ? 'is-active-grade' : '') + ' ' + (isFuture ? 'is-future-grade' : '') + '" data-grade="' + grade + '" ' + (isFuture ? 'disabled' : '') + '><span>Grade ' + grade + '</span>' + (isFuture ? '<span class="c-grade-lock-icon">' + icon('lockKeyhole', 12) + '</span>' : '') + '</button>';
    }).join('');

    if (!isEditing) {
      let rowsHtml = rows.map(function (row) {
        return '<tr>' +
          '<td>' + esc(row.subject) + '</td>' +
          '<td>' + esc(row.mark || '—') + '</td>' +
          '<td>' + esc(row.highestMark || '—') + '</td>' +
          '</tr>';
      }).join('');

      const teacherFeedback = student.recordBook && student.recordBook.feedback ? esc(student.recordBook.feedback) : "A solid performance overall in Term 1, with some room to grow in time management during exams. Well done on the effort shown.";

      return (
        '<div class="panel record-book-panel" style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: 1.5rem; box-shadow: var(--shadow-sm); margin-bottom: 2rem;">' +
        '<div class="record-book-header">' +
        '<div class="record-book-title">' +
        '<span class="record-book-icon">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>' +
        '</span>' +
        '<h3>Digital Record Book — <span id="record-grade-label">Grade ' + recordBookSelectedGrade + '</span></h3>' +
        '</div>' +
        '<button class="export-btn" id="export-pdf-btn" onclick="window.print()">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
        'Export PDF' +
        '</button>' +
        '</div>' +
        '<div class="record-book-dropdowns" id="record-book-dropdowns" style="display:flex;gap:1rem;margin-bottom:1rem;border-bottom:1px solid var(--color-border);padding-bottom:1rem;">' +
        '<div class="dropdown-group">' +
        '<label class="dropdown-label" style="font-size:11px;font-weight:700;color:rgba(15, 65, 74, 0.5);text-transform:uppercase;margin-bottom:0.25rem;display:block;">Grade</label>' +
        queueMount('select', { value: String(recordBookSelectedGrade), options: RECORDBOOK_GRADE_LEVELS.map(g => ({ label: 'Grade ' + g, value: String(g) })), tone: 'sky', placeholder: 'Select Grade', className: '[min-width:140px]', onChange: function (v) { recordBookSelectedGrade = Number(v); renderProfileRoot(); } }) +
        '</div>' +
        '<div class="dropdown-group">' +
        '<label class="dropdown-label" style="font-size:11px;font-weight:700;color:rgba(15, 65, 74, 0.5);text-transform:uppercase;margin-bottom:0.25rem;display:block;">Term</label>' +
        queueMount('select', { value: recordBookSelectedTerm, options: ['Term 1', 'Term 2', 'Term 3'].map(t => ({ label: t, value: t })), tone: 'sky', placeholder: 'Select Term', className: '[min-width:140px]', onChange: function (v) { recordBookSelectedTerm = v; renderProfileRoot(); } }) +
        '</div>' +
        '</div>' +
        '<table class="marks-table">' +
        '<thead>' +
        '<tr>' +
        '<th>Subject</th>' +
        '<th>Marks</th>' +
        '<th>Highest Mark in Class</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody id="marks-table-body">' + rowsHtml + '</tbody>' +
        '</table>' +
        '<div class="teacher-feedback-section">' +
        '<div class="teacher-feedback-header">' +
        '<span class="teacher-feedback-icon">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
        '</span>' +
        '<h4>Class Teacher\'s Feedback — <span id="feedback-term-label">' + recordBookSelectedTerm + '</span>, Grade ' + recordBookSelectedGrade + '</h4>' +
        '</div>' +
        '<div class="teacher-feedback-card" id="teacher-feedback-card" style="background: var(--cream); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1.25rem; margin-top: 0.5rem;">' +
        '<div style="display: flex; gap: 1rem;">' +
        '<div style="width: 40px; height: 40px; border-radius: 50%; background: var(--midnight); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">' +
        icon('user', 20) +
        '</div>' +
        '<div>' +
        '<p style="margin: 0 0 0.5rem; font-weight: 700; color: var(--midnight);">Mrs. Ishara Gunasekara <span style="font-weight: 500; color: rgba(15, 65, 74, 0.5); font-size: 0.875rem; margin-left: 0.5rem;">Apr 17, 2024</span></p>' +
        '<p style="margin: 0; font-size: 0.875rem; line-height: 1.5; color: rgba(15, 65, 74, 0.8);">' + teacherFeedback + '</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
      );
    }

    let rowsHtml = rows.map(function (row, index) {
      const markNumber = Number(row.mark);
      const isValid = row.mark !== '' && row.mark !== undefined && !isNaN(markNumber);
      return '<div class="c-marks-row ' + columnsClass + '">' +
        queueMount('select', {
          value: row.subject, options: withCurrentOption(RECORDBOOK_SUBJECTS, row.subject), tone: 'sky', placeholder: 'Select subject', ariaLabel: 'Subject for mark row ' + (index + 1), className: '[min-width:0]',
          onChange: function (v) { updateRecordBookMark(index, 'subject', v); }
        }) +
        '<input type="number" min="0" max="100" step="1" class="c-marks-input j-mark-input" data-index="' + index + '" value="' + esc(row.mark) + '" aria-label="Mark for ' + esc(row.subject || ('row ' + (index + 1))) + '" />' +
        '<button type="button" class="c-marks-remove j-remove-mark" data-index="' + index + '" aria-label="Remove mark row ' + (index + 1) + '">' + icon('trash2', 15) + '</button>' +
        '</div>';
    }).join('');

    const headerCols = '<span>Subject</span><span style="text-align:center;">Marks</span><span style="text-align:center;">Action</span>';

    return (
      '<section class="c-recordbook">' +
      '<div class="c-recordbook-layout">' +
      '<aside class="c-recordbook-grades"><div class="c-recordbook-grades-head">' + icon('bookOpen', 18) + '<span>Grades</span></div>' +
      '<div class="c-grade-grid">' + gradeButtons + '</div>' +
      '<p class="c-recordbook-hint">Muted grades are not yet available for this student.</p>' +
      '</aside>' +
      '<div class="c-recordbook-main">' +
      '<div class="c-recordbook-head">' +
      '<div class="c-recordbook-head-left"><div class="c-recordbook-icon">' + icon('bookOpen', 19) + '</div>' +
      '<div><p class="c-recordbook-eyebrow">Academic record</p><h3 class="c-recordbook-title c-font-display">Digital Record Book – Grade ' + recordBookSelectedGrade + '</h3></div></div>' +
      '<button type="button" class="c-add-mark-btn j-add-mark">' + icon('plus', 14) + ' Add mark</button>' +
      '</div>' +
      '<div class="c-term-tabs" role="tablist">' + ['Term 1', 'Term 2', 'Term 3'].map(function (term) {
        const unavailable = term === 'Term 3';
        const isActive = recordBookSelectedTerm === term;
        return '<button type="button" role="tab" class="c-term-tab j-recordbook-term ' + (isActive ? 'is-active-term' : '') + '" data-term="' + term + '" ' + (unavailable ? 'disabled' : '') + '>' + term + (isActive ? '<span class="c-term-tab-underline"></span>' : '') + '</button>';
      }).join('') + '</div>' +
      '<div class="c-marks-table">' +
      '<div class="c-marks-head-row ' + columnsClass + '">' + headerCols + '</div>' +
      '<div role="table">' + rowsHtml + '</div>' +
      '</div>' +
      '<p class="c-recordbook-footnote">Choose a subject and enter a score from 0 to 100. Changes are included when you save the profile.</p>' +
      '</div>' +
      '</div>' +
      '</section>'
    );
  }
  function updateRecordBookMark(index, field, value, skipRender) {
    if (field === 'mark' && value !== '') {
      const n = Number(value);
      if (!isNaN(n)) value = String(Math.max(0, Math.min(100, n)));
    }
    if (skipRender) {
      if (State.profileDraft) {
        State.profileDraft.student = State.profileDraft.student || {};
        State.profileDraft.student.recordBook = State.profileDraft.student.recordBook || {};
        const marks = State.profileDraft.student.recordBook.marks || [];
        if (marks[index]) {
          marks[index][field] = value;
        }
      }
    } else {
      updateDraft(function (current) {
        const next = cloneProfile(current);
        next.student = next.student || {};
        next.student.recordBook = next.student.recordBook || {};
        const marks = (next.student.recordBook.marks || []).slice();
        marks[index] = Object.assign({}, marks[index]);
        marks[index][field] = value;
        next.student.recordBook.marks = marks;
        return next;
      });
    }
  }

  function editFieldReadOnlyHtml(label, value) {
    return '<div><span class="c-edit-field-label">' + esc(label) + '</span><input class="c-edit-input" value="' + esc(value || 'Not assigned') + '" readonly disabled style="opacity:0.85;background:var(--color-alabaster);" /></div>';
  }

  /* ---- Editable sections for non-student roles (mirrors EditableProfileSections) ---- */
  function renderEditableProfileSections(profile, theme) {
    if (profile.role === 'teacher') {
      const teacher = profile.teacher || {};
      const emergency = parseEmergency(teacher.emergencyContact, teacher.emergencyName, teacher.emergencyPhone);
      let qualList = teacher.qualifications || [];
      if (!Array.isArray(qualList) || qualList.length === 0) {
        if (teacher.qualification) qualList = [{ title: teacher.qualification, institution: 'University', year: '' }];
        else qualList = [{ title: '', institution: '', year: '' }];
        teacher.qualifications = qualList;
      }

      let qualHtml = '<section><h3 class="c-edit-section-title">Qualifications</h3><div style="display:flex;flex-direction:column;gap:0.75rem;margin-top:0.5rem;">';
      qualList.forEach((q, idx) => {
        qualHtml += '<div style="display:grid;grid-template-columns:1fr 1fr 100px auto;gap:0.5rem;align-items:end;">' +
          '<div><span class="c-edit-field-label">Title / Degree</span><input class="c-edit-input j-qual-edit-input" data-idx="' + idx + '" data-field="title" value="' + esc(q.title || '') + '" placeholder="e.g. BSc in Science" /></div>' +
          '<div><span class="c-edit-field-label">Institution</span><input class="c-edit-input j-qual-edit-input" data-idx="' + idx + '" data-field="institution" value="' + esc(q.institution || '') + '" placeholder="e.g. University" /></div>' +
          '<div><span class="c-edit-field-label">Year</span><input class="c-edit-input j-qual-edit-input" data-idx="' + idx + '" data-field="year" value="' + esc(q.year || '') + '" placeholder="e.g. 2018" /></div>' +
          '<button type="button" class="c-btn-solid-tone c-tone-maroon j-qual-edit-remove" data-idx="' + idx + '" style="margin-bottom:0.25rem;">Remove</button>' +
          '</div>';
      });
      qualHtml += '<button type="button" class="c-btn-solid-tone c-tone-sunshine j-qual-edit-add" style="align-self:flex-start;margin-top:0.25rem;">+ Add Qualification</button></div></section>';

      const contactHtml = '<section><h3 class="c-edit-section-title">Contact & account</h3><div class="c-edit-grid">' +
        editFieldReadOnlyHtml('Reg. Number', profile.id || profile.index) +
        editFieldHtml('Institutional mail', profile.email, 'email', 'email') + editFieldHtml('Mobile number', profile.phone, 'phone', 'tel') + '</div></section>';

      return contactHtml +
        '<section><h3 class="c-edit-section-title">Class Teacher Responsibility</h3><div class="c-edit-grid">' +
        editSelectFieldHtml('Class Teacher (In charge of class)', teacher.classTeacherOf, teacherProfileClassOptions(), function (v) { updateDraftPath('teacher.classTeacherOf', v); }, 'sunshine') +
        editSelectFieldHtml('TIC programme', teacher.tic, ['Science Society', 'Chess Club', 'Debating Society'], function (v) { updateDraftPath('teacher.tic', v); }, 'sunshine') +
        editSelectFieldHtml('Subject', teacher.subject, teacherProfileSubjectOptions(), function (v) { updateDraftPath('teacher.subject', v); }, 'sunshine') +
        editFieldHtml('Workload summary', teacher.workload, 'teacher.workload', 'text', true) +
        '</div></section>' +
        '<section><h3 class="c-edit-section-title">Personal & employment</h3><div class="c-edit-grid">' +
        editFieldHtml('NIC', teacher.nic, 'teacher.nic') +
        '<div><span class="c-edit-field-label">Date of birth</span>' + queueMount('datepicker', { value: teacher.dateOfBirth || '', tone: 'sunshine', ariaLabel: 'Date of birth', onChange: function (v) { updateDraft(d => { const n = cloneProfile(d); n.teacher.dateOfBirth = v; return n; }); } }) + '</div>' +
        editFieldHtml('Personal email', teacher.personalEmail, 'teacher.personalEmail', 'email') +
        editFieldHtml('Experience (years)', teacher.experience, 'teacher.experience', 'number') +
        '<div><span class="c-edit-field-label">Join date</span>' + queueMount('datepicker', { value: teacher.joinDate || '', tone: 'sunshine', ariaLabel: 'Join date', onChange: function (v) { updateDraft(d => { const n = cloneProfile(d); n.teacher.joinDate = v; return n; }); } }) + '</div>' +
        '</div></section>' +
        '<section><h3 class="c-edit-section-title">Emergency Contact Details</h3><div class="c-edit-grid">' +
        editFieldHtml('Emergency Contact Name', emergency.name, 'teacher.emergencyName') +
        editFieldHtml('Emergency Contact Number', emergency.phone, 'teacher.emergencyPhone') +
        '</div></section>' +
        qualHtml +
        renderTeacherAssignmentEditor(teacher.subjectAssignments || []);
    }
    if (profile.role === 'parent') {
      const parent = profile.parent || {};
      const contactHtml = '<section><h3 class="c-edit-section-title">Contact & account</h3><div class="c-edit-grid">' +
        editFieldReadOnlyHtml('Reg. Number', profile.id || profile.index) +
        editFieldHtml('Email', profile.email, 'email', 'email') +
        editFieldHtml('Mobile number', profile.phone, 'phone', 'tel') +
        editFieldHtml('Home number', parent.secondaryContact, 'parent.secondaryContact') +
        '</div></section>';

      return contactHtml +
        '<section><h3 class="c-edit-section-title">Family & account</h3><div class="c-edit-grid">' +
        editSelectFieldHtml('Relationship', parent.relationship, ['Father', 'Mother', 'Guardian'], function (v) { updateDraftPath('parent.relationship', v); }, 'terracotta') +
        editSelectFieldHtml('Guardian status', parent.guardianStatus, ['Living', 'Deceased', 'Unknown'], function (v) { updateDraftPath('parent.guardianStatus', v); }, 'terracotta') +
        editFieldHtml('NIC', parent.identityReference, 'parent.identityReference') +
        editFieldHtml('Passport', parent.passport, 'parent.passport') +
        '<div><span class="c-edit-field-label">Date of birth</span>' + queueMount('datepicker', { value: parent.dateOfBirth || '', tone: 'terracotta', ariaLabel: 'Date of birth', onChange: function (v) { updateDraft(d => { const n = cloneProfile(d); n.parent.dateOfBirth = v; return n; }); } }) + '</div>' +
        editFieldHtml('Occupation', parent.occupation, 'parent.occupation') +
        editFieldHtml('Employer / workplace', parent.employer, 'parent.employer') +
        editFieldHtml('Office contact number', parent.officePhone, 'parent.officePhone') +
        editFieldHtml('Office address', parent.officeAddress, 'parent.officeAddress') +
        editFieldHtml('Residential address', parent.homeAddress, 'parent.homeAddress') +
        editFieldHtml('Emergency name', parent.emergencyName, 'parent.emergencyName') +
        editFieldHtml('Emergency contact', parent.emergencyContact, 'parent.emergencyContact') +
        '</div></section>' +
        renderListEditor('Linked student accounts', (parent.linkedStudents || []).map(function (s) { return [s.name || '', s.className || '']; }), ['Student name', 'Class'], function (rows) {
          updateDraft(function (current) {
            const next = cloneProfile(current);
            const prevList = current.parent && current.parent.linkedStudents || [];
            next.parent = next.parent || {};
            next.parent.linkedStudents = rows.map(function (row, i) { return { id: (prevList[i] && prevList[i].id) || ('linked-' + row[0]), name: row[0], className: row[1] }; });
            return next;
          });
        });
    }
    // management
    const mgmt = profile.management || {};
    const contactHtml = '<section><h3 class="c-edit-section-title">Contact & account</h3><div class="c-edit-grid">' +
      editFieldReadOnlyHtml('Reg. Number', profile.id || profile.index) +
      editFieldHtml('Institutional mail', profile.email, 'email', 'email') +
      editFieldHtml('Mobile number', profile.phone, 'phone', 'tel') +
      '</div></section>';

    return contactHtml +
      '<section><h3 class="c-edit-section-title">Employment</h3><div class="c-edit-grid">' +
      editFieldHtml('Job title', mgmt.jobTitle, 'management.jobTitle') +
      editFieldHtml('Office address', mgmt.officeAddress || mgmt.officeLocation, 'management.officeAddress') +
      '<div><span class="c-edit-field-label">Joining date</span>' + queueMount('datepicker', { value: mgmt.joiningDate || '', tone: 'maroon', ariaLabel: 'Joining date', onChange: function (v) { updateDraftPath('management.joiningDate', v); } }) + '</div>' +
      '</div></section>' +
      '<section><h3 class="c-edit-section-title">Personal information</h3><div class="c-edit-grid">' +
      editFieldHtml('NIC', mgmt.nic, 'management.nic') +
      editFieldHtml('Personal email', mgmt.personalEmail, 'management.personalEmail', 'email') +
      editFieldHtml('Residential address', mgmt.personalAddress, 'management.personalAddress', 'text', true) +
      '</div></section>' +
      '<section><h3 class="c-edit-section-title">Emergency account</h3><div class="c-edit-grid">' +
      editFieldHtml('Emergency name', mgmt.emergencyName || (mgmt.emergencyContact || '').split(' · ')[0] || '', 'management.emergencyName') +
      editFieldHtml('Emergency contact', mgmt.emergencyPhone || (mgmt.emergencyContact || '').split(' · ')[1] || '', 'management.emergencyPhone') +
      '</div></section>';
  }
  function teacherProfileClassOptions() { return GRADES.reduce(function (acc, g) { return acc.concat(g.classes); }, []); }
  function teacherProfileSubjectOptions() { return Array.from(new Set(allTeachers().map(function (t) { return t.subject; }))); }

  function editFieldHtml(label, value, bind, type, wide) {
    return '<label class="' + (wide ? 'c-edit-field-wide' : '') + '"><span class="c-edit-field-label">' + esc(label) + '</span>' +
      '<input class="c-edit-input j-bound-input" data-bind="' + esc(bind) + '" type="' + (type || 'text') + '" value="' + esc(value || '') + '" /></label>';
  }
  function editSelectFieldHtml(label, value, options, onChange, tone) {
    return '<label><span class="c-edit-field-label">' + esc(label) + '</span>' + queueMount('select', { value: value || '', options: withCurrentOption(options, value), tone: tone || 'sunshine', placeholder: 'Select ' + label.toLowerCase(), ariaLabel: label, onChange: onChange }) + '</label>';
  }

  function renderTeacherAssignmentEditor(assignments) {
    const rows = assignments.length ? assignments : [{ className: '', subject: '' }];
    let rowsHtml = rows.map(function (a, index) {
      return '<div class="c-assignment-edit-row">' +
        queueMount('select', {
          value: a.subject, options: withCurrentOption(teacherProfileSubjectOptions(), a.subject), tone: 'sunshine', placeholder: 'Select subject', ariaLabel: 'Subject assignment ' + (index + 1) + ' subject',
          onChange: function (v) { updateAssignmentRow(index, 'subject', v); }
        }) +
        queueMount('select', {
          value: a.className, options: withCurrentOption(teacherProfileClassOptions(), a.className), tone: 'sunshine', placeholder: 'Select class', ariaLabel: 'Subject assignment ' + (index + 1) + ' class',
          onChange: function (v) { updateAssignmentRow(index, 'className', v); }
        }) +
        '<button type="button" class="c-assignment-remove-btn j-remove-assignment" data-index="' + index + '" ' + (rows.length === 1 ? 'disabled' : '') + '>Remove</button>' +
        '</div>';
    }).join('');
    return '<section><div class="c-assignment-editor-head"><div><h3 class="c-edit-section-title" style="margin-bottom:0;">Subject teaching assignments</h3><p class="c-assignment-editor-desc">Choose a subject and class for each teaching assignment.</p></div>' +
      '<button type="button" class="c-assignment-add j-add-assignment">Add assignment</button></div><div style="display:flex;flex-direction:column;gap:0.5rem;">' + rowsHtml + '</div></section>';
  }
  function updateAssignmentRow(index, field, value) {
    updateDraft(function (current) {
      const next = cloneProfile(current);
      const rows = (next.teacher.subjectAssignments && next.teacher.subjectAssignments.length ? next.teacher.subjectAssignments : [{ className: '', subject: '' }]).slice();
      rows[index] = Object.assign({}, rows[index]);
      rows[index][field] = value;
      next.teacher.subjectAssignments = rows;
      return next;
    });
  }

  /** Generic "add row / remove row / edit cell" list editor (mirrors EditableListSection). */
  function renderListEditor(title, rows, labels, onChange) {
    const safeRows = rows.length ? rows : [labels.map(function () { return ''; })];
    let rowsHtml = safeRows.map(function (row, rowIndex) {
      let cells = labels.map(function (label, fieldIndex) {
        return '<input class="c-edit-input j-list-editor-cell" data-row="' + rowIndex + '" data-field="' + fieldIndex + '" placeholder="' + esc(label) + '" value="' + esc(row[fieldIndex] || '') + '" aria-label="' + esc(label) + ' ' + (rowIndex + 1) + '" />';
      }).join('');
      return '<div class="c-list-editor-row" data-row="' + rowIndex + '">' + cells + '<button type="button" class="c-list-editor-remove j-list-editor-remove" data-row="' + rowIndex + '" ' + (safeRows.length === 1 ? 'disabled' : '') + '>Remove</button></div>';
    }).join('');
    const editorId = uid('listeditor');
    pendingListEditors[editorId] = { rows: safeRows, labels: labels, onChange: onChange };
    return '<section class="j-list-editor" data-editor-id="' + editorId + '"><div class="c-list-editor-head"><h3 class="c-edit-section-title" style="margin-bottom:0;">' + esc(title) + '</h3><button type="button" class="c-list-editor-add j-list-editor-add">Add row</button></div><div class="c-list-editor-rows">' + rowsHtml + '</div></section>';
  }
  const pendingListEditors = {};

  function wireProfileModalEvents(isEditing) {
    const root = document.getElementById('j-modal-root');

    qsa('.j-modal-close', root).forEach(function (el) { el.addEventListener('click', closeProfile); });

    const form = document.getElementById('j-profile-form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); saveProfile(); });

    const nameInput = qs('.j-profile-name', root);
    if (nameInput) nameInput.addEventListener('input', function () {
      State.profileDraft.name = nameInput.value;
      State.profileNameError = '';
      const errEl = qs('.j-profile-name-error', root);
      if (errEl) {
        errEl.textContent = '';
        errEl.style.display = 'none';
      }
    });

    // generic text-input two-way binding via data-bind="a.b.c" dot paths
    qsa('.j-bound-input', root).forEach(function (input) {
      input.addEventListener('input', function () {
        const bind = input.getAttribute('data-bind');
        if (bind && State.profileDraft) {
          setProfileValue(State.profileDraft, bind, input.value);
        }
      });
    });

    // qualification editor handlers in edit profile modal
    qsa('.j-qual-edit-input', root).forEach(function (inp) {
      inp.addEventListener('input', function (e) {
        const idx = Number(e.target.dataset.idx);
        const field = e.target.dataset.field;
        if (State.profileDraft && State.profileDraft.teacher && State.profileDraft.teacher.qualifications && State.profileDraft.teacher.qualifications[idx]) {
          State.profileDraft.teacher.qualifications[idx][field] = e.target.value;
          State.profileDraft.teacher.qualification = State.profileDraft.teacher.qualifications.map(q => q.title).filter(Boolean).join(', ');
        }
      });
    });
    qsa('.j-qual-edit-remove', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const idx = Number(btn.getAttribute('data-idx'));
        if (State.profileDraft && State.profileDraft.teacher && State.profileDraft.teacher.qualifications) {
          State.profileDraft.teacher.qualifications.splice(idx, 1);
          renderProfileModal();
        }
      });
    });
    const addQualBtn = qs('.j-qual-edit-add', root);
    if (addQualBtn) {
      addQualBtn.addEventListener('click', function () {
        if (State.profileDraft && State.profileDraft.teacher) {
          if (!State.profileDraft.teacher.qualifications) State.profileDraft.teacher.qualifications = [];
          State.profileDraft.teacher.qualifications.push({ title: '', institution: '', year: '' });
          renderProfileModal();
        }
      });
    }

    // student sub-tabs
    qsa('.j-student-subtab', root).forEach(function (btn) {
      btn.addEventListener('click', function () { State.profileActiveSubTab = btn.getAttribute('data-tab'); renderProfileModal(); });
    });

    // record book: grade selector + term selector are local (non-profile) UI state
    qsa('.j-recordbook-grade', root).forEach(function (btn) {
      btn.addEventListener('click', function () { recordBookSelectedGrade = Number(btn.getAttribute('data-grade')); renderProfileModal(); });
    });
    qsa('.j-recordbook-term', root).forEach(function (btn) {
      btn.addEventListener('click', function () { if (!btn.disabled) { recordBookSelectedTerm = btn.getAttribute('data-term'); renderProfileModal(); } });
    });
    qsa('.j-mark-input', root).forEach(function (input) {
      input.addEventListener('input', function () {
        updateRecordBookMark(Number(input.getAttribute('data-index')), 'mark', input.value, true);
      });
    });
    const addMarkBtn = qs('.j-add-mark', root);
    if (addMarkBtn) addMarkBtn.addEventListener('click', function () {
      updateDraft(function (current) {
        const next = cloneProfile(current);
        next.student = next.student || {}; next.student.recordBook = next.student.recordBook || {};
        next.student.recordBook.marks = (next.student.recordBook.marks || []).concat([{ subject: '', mark: '' }]);
        return next;
      });
    });
    qsa('.j-remove-mark', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const index = Number(btn.getAttribute('data-index'));
        updateDraft(function (current) {
          const next = cloneProfile(current);
          next.student.recordBook.marks = (next.student.recordBook.marks || []).filter(function (_, i) { return i !== index; });
          return next;
        });
      });
    });

    // extracurriculars
    const addExtraBtn = qs('.j-add-extracurricular', root);
    if (addExtraBtn) addExtraBtn.addEventListener('click', function () {
      updateDraft(function (current) {
        const next = cloneProfile(current);
        next.student.extracurriculars = (next.student.extracurriculars || []).concat([{ name: '', role: '', status: 'Active' }]);
        return next;
      });
    });
    qsa('.j-remove-extracurricular', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const index = Number(btn.getAttribute('data-index'));
        updateDraft(function (current) {
          const next = cloneProfile(current);
          next.student.extracurriculars = (next.student.extracurriculars || []).filter(function (_, i) { return i !== index; });
          return next;
        });
      });
    });

    // achievements
    qsa('.j-achievement-title', root).forEach(function (input) {
      input.addEventListener('input', function () {
        const index = Number(input.getAttribute('data-index'));
        updateAchievement(index, 'title', input.value, true);
      });
    });
    qsa('.j-achievement-year', root).forEach(function (input) {
      input.addEventListener('input', function () {
        const index = Number(input.getAttribute('data-index'));
        updateAchievement(index, 'year', input.value, true);
      });
    });

    // teacher assignment editor
    const addAssignmentBtn = qs('.j-add-assignment', root);
    if (addAssignmentBtn) addAssignmentBtn.addEventListener('click', function () {
      updateDraft(function (current) {
        const next = cloneProfile(current);
        const rows = (next.teacher.subjectAssignments && next.teacher.subjectAssignments.length ? next.teacher.subjectAssignments : [{ className: '', subject: '' }]).slice();
        rows.push({ className: '', subject: '' });
        next.teacher.subjectAssignments = rows;
        return next;
      });
    });
    qsa('.j-remove-assignment', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const index = Number(btn.getAttribute('data-index'));
        updateDraft(function (current) {
          const next = cloneProfile(current);
          next.teacher.subjectAssignments = (next.teacher.subjectAssignments || []).filter(function (_, i) { return i !== index; });
          return next;
        });
      });
    });

    // generic list editors (linked students on parent profile, etc.)
    qsa('.j-list-editor', root).forEach(function (section) {
      const editorId = section.getAttribute('data-editor-id');
      const editorState = pendingListEditors[editorId];
      if (!editorState) return;
      qsa('.j-list-editor-cell', section).forEach(function (input) {
        input.addEventListener('input', function () {
          const caret = input.selectionStart;
          const rowIndex = Number(input.getAttribute('data-row'));
          const fieldIndex = Number(input.getAttribute('data-field'));
          const rows = editorState.rows.map(function (r) { return r.slice(); });
          rows[rowIndex][fieldIndex] = input.value;
          editorState.onChange(rows);
          window.requestAnimationFrame(function () {
            const freshSection = qs('.j-list-editor[data-editor-id="' + editorId + '"]', document.getElementById('j-modal-root'));
            if (!freshSection) return;
            const freshInput = qs('.j-list-editor-cell[data-row="' + rowIndex + '"][data-field="' + fieldIndex + '"]', freshSection);
            if (freshInput) { freshInput.focus(); try { freshInput.setSelectionRange(caret, caret); } catch (e) { } }
          });
        });
      });
      qsa('.j-list-editor-remove', section).forEach(function (btn) {
        btn.addEventListener('click', function () {
          const rowIndex = Number(btn.getAttribute('data-row'));
          const rows = editorState.rows.filter(function (_, i) { return i !== rowIndex; });
          editorState.onChange(rows);
        });
      });
      const addBtn = qs('.j-list-editor-add', section);
      if (addBtn) addBtn.addEventListener('click', function () {
        const rows = editorState.rows.concat([editorState.labels.map(function () { return ''; })]);
        editorState.onChange(rows);
      });
    });

    // related-profile links (guardian card / linked students by resolved directory id)
    qsa('.j-open-linked-student-id', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-id');
        const profile = allStudents().find(function (s) { return s.index === id; });
        if (profile) { openProfile(toStudentProfile(profile), 'view'); return; }
        const parent = allParents().find(function (p) { return p.id === id; });
        if (parent) { openProfile(toParentProfile(parent), 'view'); }
      });
    });
  }

  /* =====================================================================
     15. ENROLLMENT FORM PAGE
     Mirrors src/pages/Enrollment.tsx.
     ===================================================================== */
  function enrollmentFieldHtml(label, control, opts) {
    opts = opts || {};
    return '<div class="c-form-field ' + (opts.span2 ? 'c-span-2' : '') + '">' +
      '<p class="c-form-field-label">' + esc(label) + ' ' + (opts.required ? '<span class="c-required-mark" style="color:var(--color-skyblue);">*</span>' : '') +
      (opts.helper ? '<em class="c-field-helper">' + esc(opts.helper) + '</em>' : '') + '</p>' + control + '</div>';
  }
  function enrollmentTextInput(bind, placeholder, type) {
    const v = State.enrollmentForm[bind];
    return '<input class="c-form-input j-enrollment-input" data-bind="' + bind + '" type="' + (type || 'text') + '" placeholder="' + esc(placeholder || '') + '" value="' + esc(v || '') + '" />';
  }

  function renderEnrollmentPage() {
    const draftPill = document.getElementById('j-enrollment-draft-pill');
    draftPill.textContent = State.enrollmentDraftSaved ? 'Draft saved' : 'Draft';
    draftPill.classList.toggle('is-saved-draft', State.enrollmentDraftSaved);

    const noticeHost = document.getElementById('j-enrollment-notice');
    if (State.enrollmentNotice) {
      noticeHost.style.display = '';
      noticeHost.innerHTML = '<div class="' + (State.enrollmentNotice.kind === 'success' ? 'c-success-banner' : 'c-error-banner') + '">' + icon('checkCircle2', 17) +
        '<span>' + esc(State.enrollmentNotice.message) + '</span>' +
        '<button type="button" class="c-banner-dismiss j-dismiss-enrollment-notice" aria-label="Dismiss notification">' + icon('x', 16) + '</button></div>';
    } else { noticeHost.style.display = 'none'; noticeHost.innerHTML = ''; }

    const form = State.enrollmentForm;
    const availableClasses = GRADE_CLASS_MAP[form.grade] || [];

    const fieldsHtml =
      enrollmentFieldHtml('Full Name', enrollmentTextInput('fullName', 'e.g. Malsha Anjali Jayarathne'), { required: true }) +
      enrollmentFieldHtml('First Name', enrollmentTextInput('firstName', 'e.g. Malsha'), { required: true }) +
      enrollmentFieldHtml('Last Name', enrollmentTextInput('lastName', 'e.g. Jayarathne'), { required: true }) +
      enrollmentFieldHtml('Date of Birth', queueMount('datepicker', { value: form.dateOfBirth, tone: 'sky', ariaLabel: 'Date of Birth', onChange: function (v) { State.enrollmentForm.dateOfBirth = v; renderEnrollmentPage(); } }), { required: true }) +
      enrollmentFieldHtml('Gender', queueMount('select', { value: form.gender, options: ['Female', 'Male', 'Prefer not to say'], placeholder: 'Select gender', ariaLabel: 'Gender', className: 'c-enrollment-select', onChange: function (v) { State.enrollmentForm.gender = v; renderEnrollmentPage(); } }), { required: true }) +
      enrollmentFieldHtml('NIC', enrollmentTextInput('nationalId', 'NIC if issued'), { helper: 'optional' }) +
      enrollmentFieldHtml('Birth Certificate No.', enrollmentTextInput('birthCertificateNumber', 'Birth Cert. No.'), { required: true }) +
      enrollmentFieldHtml('Grade', queueMount('select', { value: form.grade, options: Object.keys(GRADE_CLASS_MAP), placeholder: 'Select grade', ariaLabel: 'Grade', onChange: function (v) { State.enrollmentForm.grade = v; State.enrollmentForm.classSection = ''; renderEnrollmentPage(); } }), { required: true }) +
      enrollmentFieldHtml('Class / Section', queueMount('select', { value: form.classSection, options: availableClasses, placeholder: 'Select class / section', ariaLabel: 'Class / Section', disabled: !form.grade, onChange: function (v) { State.enrollmentForm.classSection = v; renderEnrollmentPage(); } }), { required: true, helper: form.grade ? ('Choose a ' + form.grade + ' class') : 'Select grade first' }) +
      enrollmentFieldHtml('Religion', State.enrollmentForm.religionCustom ? queueMount('customReligion', { value: form.religion }) : queueMount('select', { value: form.religion, options: ['Prefer not to say', 'Buddhism', 'Catholic', 'Hinduism', 'Islam', 'Other'], placeholder: 'Select religion', ariaLabel: 'Religion', onChange: function (v) { if (v === 'Other') { State.enrollmentForm.religionCustom = true; State.enrollmentForm.religion = ''; } else { State.enrollmentForm.religion = v; } renderEnrollmentPage(); } }), { helper: 'optional' }) +
      enrollmentFieldHtml('Residential address', '<textarea class="c-form-textarea j-enrollment-textarea" data-bind="homeAddress" rows="3" placeholder="No., Street, Town">' + esc(form.homeAddress) + '</textarea>', { required: true, span2: true }) +
      enrollmentFieldHtml('Admission Date', queueMount('datepicker', { value: form.admissionDate, tone: 'sky', ariaLabel: 'Admission Date', onChange: function (v) { State.enrollmentForm.admissionDate = v; renderEnrollmentPage(); } }), { required: true }) +
      enrollmentFieldHtml('Nationality', enrollmentTextInput('nationality', 'e.g. Sri Lankan'), { required: true }) +
      enrollmentFieldHtml('Educational Zone', queueMount('select', { value: form.educationalZone, options: ZONE_OPTIONS, placeholder: 'Select zone', ariaLabel: 'Educational Zone', onChange: function (v) { State.enrollmentForm.educationalZone = v; renderEnrollmentPage(); } }), { required: true }) +
      enrollmentFieldHtml('District', queueMount('select', { value: form.district, options: DISTRICT_OPTIONS, placeholder: 'Select district', ariaLabel: 'District', onChange: function (v) { State.enrollmentForm.district = v; renderEnrollmentPage(); } }), { required: true }) +
      enrollmentFieldHtml('Province', queueMount('select', { value: form.province, options: PROVINCE_OPTIONS, placeholder: 'Select province', ariaLabel: 'Province', onChange: function (v) { State.enrollmentForm.province = v; renderEnrollmentPage(); } }), { required: true }) +
      enrollmentFieldHtml('Previous School', enrollmentTextInput('previousSchool', ''), { helper: 'optional' }) +
      enrollmentFieldHtml('Blood Group', queueMount('select', { value: form.bloodGroup, options: ['Not provided', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], placeholder: 'Select blood group', ariaLabel: 'Blood Group', onChange: function (v) { State.enrollmentForm.bloodGroup = v; renderEnrollmentPage(); } }), { required: true }) +
      enrollmentFieldHtml('Profile Photo', '<div class="c-photo-field"><input type="file" accept="image/jpeg,image/png,image/webp" class="c-visually-hidden j-photo-input" id="j-photo-input" />' +
        '<button type="button" class="c-photo-choose-btn j-photo-choose">' + icon('upload', 14) + ' Choose file</button>' +
        '<span class="c-photo-filename">' + esc(State.enrollmentPhotoName || 'No file chosen') + '</span></div>', { helper: 'optional' }) +
      enrollmentFieldHtml('Medical Notes / Allergies', '<textarea class="c-form-textarea j-enrollment-textarea" data-bind="medicalNotes" rows="3" placeholder="e.g. Asthma, peanut allergy">' + esc(form.medicalNotes) + '</textarea>', { span2: true, helper: 'optional — visible to admin and class teacher only, never public' });

    document.getElementById('j-enrollment-fields').innerHTML = fieldsHtml;
    document.getElementById('j-enrollment-submit').disabled = State.enrollmentSubmitting;
    document.getElementById('j-enrollment-submit-label').textContent = State.enrollmentSubmitting ? 'Enrolling…' : 'Enroll student';

    flushMounts();
    wireEnrollmentEvents();
  }

  function wireEnrollmentEvents() {
    const dismissBtn = qs('.j-dismiss-enrollment-notice');
    if (dismissBtn) dismissBtn.addEventListener('click', function () { State.enrollmentNotice = null; renderEnrollmentPage(); });

    qsa('.j-enrollment-input').forEach(function (input) {
      input.addEventListener('input', function () {
        const caret = input.selectionStart; const bind = input.getAttribute('data-bind');
        State.enrollmentForm[bind] = input.value; State.enrollmentNotice = null; State.enrollmentDraftSaved = false;
        const notice = document.getElementById('j-enrollment-notice'); if (notice) notice.style.display = 'none';
        const draft = document.getElementById('j-enrollment-draft-pill'); if (draft) draft.textContent = 'Draft';
      });
    });
    qsa('.j-enrollment-textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        const caret = input.selectionStart; const bind = input.getAttribute('data-bind');
        State.enrollmentForm[bind] = input.value; State.enrollmentNotice = null; State.enrollmentDraftSaved = false;
        const notice = document.getElementById('j-enrollment-notice'); if (notice) notice.style.display = 'none';
        const draft = document.getElementById('j-enrollment-draft-pill'); if (draft) draft.textContent = 'Draft';
      });
    });
    const photoChoose = qs('.j-photo-choose');
    if (photoChoose) photoChoose.addEventListener('click', function () { qs('.j-photo-input').click(); });
    const photoInput = qs('.j-photo-input');
    if (photoInput) photoInput.addEventListener('change', function () {
      const file = photoInput.files[0];
      if (!file) return;
      if (file.type.indexOf('image/') !== 0) {
        State.enrollmentNotice = { kind: 'error', message: 'Choose a JPG, PNG, or WEBP image for the profile photo.' };
        photoInput.value = ''; renderEnrollmentPage(); return;
      }
      if (file.size > 5 * 1024 * 1024) {
        State.enrollmentNotice = { kind: 'error', message: 'Choose a profile photo smaller than 5 MB.' };
        photoInput.value = ''; renderEnrollmentPage(); return;
      }
      State.enrollmentPhotoName = file.name; State.enrollmentNotice = null; State.enrollmentDraftSaved = false;
      renderEnrollmentPage();
    });
  }

  document.getElementById('j-enrollment-save-draft').addEventListener('click', function () {
    State.enrollmentDraftSaved = true;
    State.enrollmentNotice = { kind: 'success', message: 'Student enrollment draft saved locally.' };
    renderEnrollmentPage();
  });

  document.getElementById('j-enrollment-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = State.enrollmentForm;
    var validationResult = window.Validation.validateStudentEnrollment(form);
    if (!validationResult.valid) { State.enrollmentNotice = { kind: 'error', message: validationResult.message }; renderEnrollmentPage(); return; }
    const availableClasses = GRADE_CLASS_MAP[form.grade] || [];
    if (availableClasses.indexOf(form.classSection) === -1) { State.enrollmentNotice = { kind: 'error', message: 'Choose a class that belongs to the selected grade.' }; renderEnrollmentPage(); return; }

    const regNumber = 'NEW/' + Date.now().toString().slice(-6);
    const fullName = (form.firstName || '') + ' ' + (form.lastName || '');
    const emailHandle = fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
    State.addedStudents.push({
      activities: [], activityTag: 'bg-skyblue/20 text-midnight', avatar: 'bg-skyblue text-midnight',
      className: form.classSection, email: (emailHandle || 'student') + '.' + regNumber.slice(-4) + '@lecole.com',
      grade: form.grade, index: regNumber, initials: makeInitials((form.firstName || '') + ' ' + (form.lastName || '')), firstName: (form.firstName || '').trim(), lastName: (form.lastName || '').trim(), fullName: (form.fullName || '').trim(),
      phone: 'Not recorded', status: 'Active',
      profile: {
        personal: { birthCertificateNumber: form.nationalId, dateOfBirth: formatDateDisplay(form.dateOfBirth), gender: form.gender, religion: (form.religion === 'Other' ? form.religionOther : form.religion) || 'Not recorded', admissionDate: formatDateDisplay(form.admissionDate), bloodGroup: form.bloodGroup, medicalNotes: form.medicalNotes },
        recordBook: { documents: [], previousSchool: { name: form.previousSchool || 'Not recorded' } },
        residential: { address: form.homeAddress }
      }
    });
    State.classEnrollments[form.classSection] = (State.classEnrollments[form.classSection] || 0) + 1;
    State.enrollmentSubmitting = true;
    State.enrollmentNotice = { kind: 'success', message: form.fullName + "'s student record was added to " + form.grade + ', ' + form.classSection + '.' };
    renderEnrollmentPage();
    window.setTimeout(function () {
      State.enrollmentForm = { firstName: '', lastName: '', dateOfBirth: '', gender: '', nationalId: '', grade: '', classSection: '', religion: '', religionOther: '', homeAddress: '', admissionDate: '', previousSchool: '', bloodGroup: '', medicalNotes: '' };
      State.enrollmentPhotoName = ''; State.enrollmentSubmitting = false; State.enrollmentNotice = null; State.enrollmentDraftSaved = false;
      navigate('people', 'class=' + encodeURIComponent(form.classSection));
    }, 900);
  });

  /* =====================================================================
     16. ADD TEACHER / PARENT / MANAGEMENT FORM PAGES
     Mirrors src/features/people/AddTeacher.tsx, AddParent.tsx,
     AddManagement.tsx. These three follow the same shape, so a couple of
     tiny shared helpers (formFieldHtml / formTextInput) do most of the work.
     ===================================================================== */
  function formFieldHtml(label, control, opts) {
    opts = opts || {};
    return '<div class="c-form-field ' + (opts.span2 ? 'c-span-2' : '') + '">' +
      '<label class="c-form-field-label">' + esc(label) + ' ' + (opts.required ? '<span class="c-required-mark" style="color:' + (opts.toneColor || 'var(--color-sunshine)') + ';">*</span>' : '') + '</label>' +
      control + (opts.note ? '<p class="c-form-note">' + esc(opts.note) + '</p>' : '') + '</div>';
  }
  function formTextInput(stateBag, bind, placeholder, type, disabled) {
    const v = stateBag[bind];
    return '<input class="c-form-input j-form-input" data-bag="' + stateBag.__bag + '" data-bind="' + bind + '" type="' + (type || 'text') + '" placeholder="' + esc(placeholder || '') + '" value="' + esc(v || '') + '" ' + (disabled ? 'disabled' : '') + ' />';
  }

  // -------------------- ADD TEACHER --------------------
  function renderAddTeacherPage() {
    State.addTeacherForm.__bag = 'addTeacherForm';
    const form = State.addTeacherForm;
    const institutionalEmail = makeInstitutionalEmail((form.firstName || '') + ' ' + (form.lastName || ''));

    const noticeHost = document.getElementById('j-add-teacher-notice');
    renderFormMessage(noticeHost, State.addTeacherMessage);

    document.getElementById('j-add-teacher-fields').innerHTML =
      formFieldHtml('Full Name', formTextInput(form, 'fullName', 'e.g. Sarah Peiris'), { required: true, span2: true }) +
      formFieldHtml('First Name', formTextInput(form, 'firstName', 'e.g. Sarah'), { required: true }) +
      formFieldHtml('Last Name', formTextInput(form, 'lastName', 'e.g. Peiris'), { required: true, note: 'Used to create the institutional address.' }) +
      formFieldHtml('NIC', formTextInput(form, 'nic', 'e.g. 198712345678V'), { required: true }) +
      formFieldHtml('Date of Birth', queueMount('datepicker', { value: form.dateOfBirth, tone: 'sunshine', ariaLabel: 'Date of Birth', onChange: function (v) { State.addTeacherForm.dateOfBirth = v; State.addTeacherMessage = ''; renderAddTeacherPage(); } }), { required: true }) +
      formFieldHtml('Office address', formTextInput(form, 'officeAddress', 'e.g. Main Building, Room 102')) +
      formFieldHtml('Mobile number', formTextInput(form, 'phone', 'e.g. +94 70 456 7890', 'tel'), { required: true }) +
      formFieldHtml('Personal Email', formTextInput(form, 'personalEmail', 'e.g. sarah.p@gmail.com', 'email'), { required: true }) +
      formFieldHtml('Institutional Email', '<input class="c-form-input" disabled value="' + esc(institutionalEmail) + '" />', { span2: true });

    document.getElementById('j-add-teacher-professional-fields').innerHTML =
      formFieldHtml('Subjects Qualified to Teach', formTextInput(form, 'subjects', 'e.g. Mathematics, Physics'), { required: true }) +
      formFieldHtml('Years of Experience', formTextInput(form, 'experience', 'e.g. 5', 'number'), { required: true }) +
      formFieldHtml('Join Date', queueMount('datepicker', { value: form.joinDate, tone: 'sunshine', ariaLabel: 'Join Date', onChange: function (v) { State.addTeacherForm.joinDate = v; State.addTeacherMessage = ''; renderAddTeacherPage(); } }), { required: true });

    let qualHtml = '<div style="display:flex;flex-direction:column;gap:1rem;">';
    form.qualifications.forEach((q, i) => {
      qualHtml += '<div style="display:grid;grid-template-columns:1fr 1fr 100px auto;gap:0.75rem;align-items:end;">' +
        formFieldHtml('Title / Degree', '<input class="c-form-input j-qual-input" data-idx="' + i + '" data-field="title" value="' + esc(q.title) + '" placeholder="e.g. BSc in Mathematics" />') +
        formFieldHtml('Institution', '<input class="c-form-input j-qual-input" data-idx="' + i + '" data-field="institution" value="' + esc(q.institution) + '" placeholder="e.g. University of Colombo" />') +
        formFieldHtml('Year', '<input class="c-form-input j-qual-input" data-idx="' + i + '" data-field="year" value="' + esc(q.year) + '" placeholder="2018" />') +
        '<button type="button" class="c-btn-solid-tone c-tone-maroon j-qual-remove" data-idx="' + i + '" style="margin-bottom:0.25rem;">Remove</button>' +
        '</div>';
    });
    qualHtml += '<button type="button" class="c-btn-solid-tone c-tone-sunshine j-qual-add" style="align-self:flex-start;">+ Add Qualification</button></div>';

    document.getElementById('j-add-teacher-qual-fields').innerHTML = qualHtml;

    document.getElementById('j-add-teacher-emergency-fields').innerHTML =
      formFieldHtml('Contact Name', formTextInput(form, 'emergencyName', 'e.g. John Doe'), { required: true }) +
      formFieldHtml('Contact mobile number', formTextInput(form, 'emergencyPhone', 'e.g. +94 77 123 4567', 'tel'), { required: true });

    flushMounts();
    wireFormInputs('j-add-teacher-form', function () { State.addTeacherMessage = ''; renderAddTeacherPage(); });

    qsa('.j-qual-input', document.getElementById('j-add-teacher-qual-fields')).forEach(inp => {
      inp.addEventListener('input', e => {
        State.addTeacherForm.qualifications[e.target.dataset.idx][e.target.dataset.field] = e.target.value;
      });
    });
    qsa('.j-qual-remove', document.getElementById('j-add-teacher-qual-fields')).forEach(btn => {
      btn.addEventListener('click', e => {
        State.addTeacherForm.qualifications.splice(e.target.dataset.idx, 1);
        renderAddTeacherPage();
      });
    });
    qs('.j-qual-add', document.getElementById('j-add-teacher-qual-fields')).addEventListener('click', () => {
      State.addTeacherForm.qualifications.push({ title: '', institution: '', year: '' });
      renderAddTeacherPage();
    });
  }
  function makeInstitutionalEmail(name) {
    const parts = (name || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0] + '@lecole.com';
    const first = parts[0];
    const last = parts[parts.length - 1];
    return first + '.' + last + '@lecole.com';
  }
  document.getElementById('j-add-teacher-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = State.addTeacherForm;
    var validationResult = window.Validation.validateTeacherEnrollment(form);
    if (!validationResult.valid) { State.addTeacherMessage = validationResult.message; renderAddTeacherPage(); return; }
    State.addedTeachers.push({
      classes: [], email: makeInstitutionalEmail((form.firstName || '') + ' ' + (form.lastName || '')), id: createDirectoryId('FAC'), initials: makeInitials((form.firstName || '') + ' ' + (form.lastName || '')),
      firstName: (form.firstName || '').trim(), lastName: (form.lastName || '').trim(), phone: form.phone.trim(), role: 'Teacher', status: 'Active', subject: form.subjects.trim(), tic: 'Not assigned', tone: 'bg-sunshine text-white',
      nic: form.nic.trim(), dateOfBirth: formatDateDisplay(form.dateOfBirth), personalEmail: form.personalEmail.trim(), experience: form.experience.trim(), qualifications: JSON.parse(JSON.stringify(form.qualifications)), joinDate: formatDateDisplay(form.joinDate), emergencyContact: form.emergencyName.trim() + ' · ' + form.emergencyPhone.trim()
    });
    State.addTeacherMessage = form.fullName + "'s account was added to Teaching Staff. Returning to the directory…";
    renderAddTeacherPage();
    window.setTimeout(function () {
      State.addTeacherForm = { fullName: '', nic: '', dateOfBirth: '', phone: '', personalEmail: '', subjects: '', experience: '', qualifications: [], joinDate: '', emergencyName: '', emergencyPhone: '' };
      State.addTeacherMessage = '';
      navigate('people', 'tab=Teachers');
    }, 900);
  });

  // -------------------- ADD PARENT --------------------
  function renderAddParentPage() {
    State.addParentForm.__bag = 'addParentForm';
    const form = State.addParentForm;
    renderFormMessage(document.getElementById('j-add-parent-notice'), State.addParentMessage);

    document.getElementById('j-add-parent-fields').innerHTML =
      formFieldHtml('Relationship to Student', queueMount('select', { value: form.relationship, options: ['Father', 'Mother', 'Guardian'], placeholder: 'Select relationship', ariaLabel: 'Relationship', tone: 'terracotta', onChange: function (v) { State.addParentForm.relationship = v; State.addParentMessage = ''; renderAddParentPage(); } }), { required: true, toneColor: 'var(--color-terracotta)' }) +
      formFieldHtml('Full Name', formTextInput(form, 'fullName', 'e.g. Suresh Perera'), { required: true, span2: true, toneColor: 'var(--color-terracotta)' }) +
      formFieldHtml('First Name', formTextInput(form, 'firstName', 'e.g. Suresh'), { required: true, span2: true, toneColor: 'var(--color-terracotta)' }) +
      formFieldHtml('Last Name', formTextInput(form, 'lastName', 'e.g. Perera'), { required: true, span2: true, toneColor: 'var(--color-terracotta)' }) +
      formFieldHtml('NIC', formTextInput(form, 'nic', 'e.g. 198012345678V'), { required: true, toneColor: 'var(--color-terracotta)' }) +
      formFieldHtml('Date of Birth', queueMount('datepicker', { value: form.dateOfBirth, tone: 'terracotta', ariaLabel: 'Date of Birth', onChange: function (v) { State.addParentForm.dateOfBirth = v; renderAddParentPage(); } }), { required: true, toneColor: 'var(--color-terracotta)' }) +
      formFieldHtml('Passport No. (if NIC unavailable)', formTextInput(form, 'passport', 'e.g. N1234567')) +
      formFieldHtml('Occupation', formTextInput(form, 'occupation', 'e.g. Engineer'), { required: true, toneColor: 'var(--color-terracotta)' }) +
      formFieldHtml('Employer / Place of Work', formTextInput(form, 'employer', 'e.g. Tech Solutions Ltd')) +
      formFieldHtml('Mobile Number', formTextInput(form, 'mobile', 'e.g. 07X XXX XXXX', 'tel'), { required: true, toneColor: 'var(--color-terracotta)' }) +
      formFieldHtml('Home number', formTextInput(form, 'homePhone', 'e.g. 0XX XXX XXXX', 'tel')) +
      formFieldHtml('Office number', formTextInput(form, 'officePhone', 'e.g. 0XX XXX XXXX', 'tel')) +
      formFieldHtml('Office address', formTextInput(form, 'officeAddress', 'e.g. 123 Office Road')) +
      formFieldHtml('Email Address', formTextInput(form, 'email', 'e.g. parent@email.com', 'email')) +
      formFieldHtml('Emergency name', formTextInput(form, 'emergencyName', 'e.g. Amal Perera')) +
      formFieldHtml('Emergency contact', formTextInput(form, 'emergencyContact', 'e.g. +94 77 123 4567', 'tel'));

    flushMounts();
    wireFormInputs('j-add-parent-form', function () { State.addParentMessage = ''; renderAddParentPage(); });
  }
  document.getElementById('j-add-parent-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = State.addParentForm;
    var validationResult = window.Validation.validateParentEnrollment(form);
    if (!validationResult.valid) { State.addParentMessage = validationResult.message; renderAddParentPage(); return; }
    State.addedParents.push({
      employer: form.employer.trim() || 'Not recorded', homeAddress: 'Not recorded', id: createDirectoryId('PAR'),
      identityReference: form.nic || form.passport, initials: makeInitials((form.firstName || '') + ' ' + (form.lastName || '')), firstName: (form.firstName || '').trim(), lastName: (form.lastName || '').trim(), fullName: (form.fullName || '').trim(), occupation: form.occupation.trim(),
      phone: form.mobile.trim(), relation: form.relationship, secondaryContact: form.homePhone.trim() || 'Not recorded', officePhone: form.officePhone.trim() || 'Not recorded', officeAddress: (form.officeAddress || '').trim() || 'Not recorded', emergencyName: (form.emergencyName || '').trim() || 'Not recorded', emergencyContact: (form.emergencyContact || '').trim() || 'Not recorded', status: 'Active', tone: 'bg-deepsea text-white',
      dateOfBirth: form.dateOfBirth ? formatDateDisplay(form.dateOfBirth) : 'Not recorded', passport: form.passport.trim() || 'Not recorded'
    });
    State.addParentMessage = form.fullName + "'s parent / guardian account was added to the directory. Returning to Users…";
    renderAddParentPage();
    window.setTimeout(function () {
      State.addParentForm = { relationship: '', firstName: '', lastName: '', nic: '', dateOfBirth: '', passport: '', occupation: '', employer: '', mobile: '', homePhone: '', officePhone: '', officeAddress: '', email: '', emergencyName: '', emergencyContact: '' };
      State.addParentMessage = '';
      navigate('people', 'tab=Parents');
    }, 900);
  });

  // -------------------- ADD MANAGEMENT --------------------
  function renderAddManagementPage() {
    State.addManagementForm.__bag = 'addManagementForm';
    const form = State.addManagementForm;
    const institutionalEmail = makeInstitutionalEmail((form.firstName || '') + ' ' + (form.lastName || ''));
    renderFormMessage(document.getElementById('j-add-management-notice'), State.addManagementMessage);

    document.getElementById('j-add-management-fields').innerHTML =
      formFieldHtml('Full Name', formTextInput(form, 'fullName', 'e.g. Alex Thompson'), { required: true, span2: true, toneColor: 'var(--color-maroon)' }) +
      formFieldHtml('First Name', formTextInput(form, 'firstName', 'e.g. Alex'), { required: true, toneColor: 'var(--color-maroon)' }) +
      formFieldHtml('Last Name', formTextInput(form, 'lastName', 'e.g. Thompson'), { required: true, toneColor: 'var(--color-maroon)' }) +
      formFieldHtml('NIC', formTextInput(form, 'nic', 'e.g. 198512345678V'), { required: true, toneColor: 'var(--color-maroon)' }) +
      formFieldHtml('Contact Number', formTextInput(form, 'phone', 'e.g. +94 77 123 4567', 'tel'), { required: true, toneColor: 'var(--color-maroon)' }) +
      formFieldHtml('Personal Email', formTextInput(form, 'personalEmail', 'e.g. alex.t@gmail.com', 'email'), { required: true, toneColor: 'var(--color-maroon)' }) +
      formFieldHtml('Institutional Email', '<input class="c-form-input" disabled value="' + esc(institutionalEmail) + '" />', { span2: true });

    document.getElementById('j-add-management-employment-fields').innerHTML =

      formFieldHtml('Join Date', queueMount('datepicker', { value: form.joinDate, tone: 'maroon', ariaLabel: 'Join Date', onChange: function (v) { State.addManagementForm.joinDate = v; State.addManagementMessage = ''; renderAddManagementPage(); } }), { required: true, toneColor: 'var(--color-maroon)' });

    document.getElementById('j-add-management-emergency-fields').innerHTML =
      formFieldHtml('Contact Name', formTextInput(form, 'emergencyName', 'e.g. Jane Doe'), { required: true, toneColor: 'var(--color-maroon)' }) +
      formFieldHtml('Contact Number', formTextInput(form, 'emergencyPhone', 'e.g. +94 77 123 4567', 'tel'), { required: true, toneColor: 'var(--color-maroon)' });

    flushMounts();
    wireFormInputs('j-add-management-form', function () { State.addManagementMessage = ''; renderAddManagementPage(); });
  }
  document.getElementById('j-add-management-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = State.addManagementForm;
    var validationResult = window.Validation.validateManagementEnrollment(form);
    if (!validationResult.valid) { State.addManagementMessage = validationResult.message; renderAddManagementPage(); return; }
    State.addedManagement.push({
      email: makeInstitutionalEmail((form.firstName || '') + ' ' + (form.lastName || '')), emergencyContact: form.emergencyName.trim() + ' · ' + form.emergencyPhone.trim(),
      id: createDirectoryId('MGT'), initials: makeInitials((form.firstName || '') + ' ' + (form.lastName || '')), joiningDate: formatDateDisplay(form.joinDate), jobTitle: form.jobTitle.trim(),
      firstName: (form.firstName || '').trim(), lastName: (form.lastName || '').trim(), officeLocation: form.officeLocation.trim() || 'Not recorded', officeAddress: (form.officeAddress || '').trim() || 'Not recorded', personalAddress: 'Not recorded',
      personalEmail: form.personalEmail.trim(), phone: form.phone.trim(), status: 'Active', tone: 'bg-maroon text-white',
      nic: form.nic.trim()
    });
    State.addManagementMessage = form.fullName + "'s management account was added to the directory. Returning to Users…";
    renderAddManagementPage();
    window.setTimeout(function () {
      State.addManagementForm = { fullName: '', nic: '', phone: '', personalEmail: '', jobTitle: '', officeLocation: '', joinDate: '', emergencyName: '', emergencyPhone: '' };
      State.addManagementMessage = '';
      navigate('people', 'tab=Management%20Panel');
    }, 900);
  });

  // -------------------- shared form helpers --------------------
  function renderFormMessage(host, message) {
    if (!message) { host.style.display = 'none'; host.innerHTML = ''; return; }
    const isError = message.indexOf('Complete') === 0 || message.indexOf('Enter') === 0;
    host.style.display = '';
    host.innerHTML = '<p class="' + (isError ? 'c-error-banner' : 'c-success-banner') + '" style="display:block;">' + esc(message) + '</p>';
  }
  const FORM_STATE_BAGS = { addTeacherForm: 'addTeacherForm', addParentForm: 'addParentForm', addManagementForm: 'addManagementForm' };
  function wireFormInputs(formId, onAfterChange) {
    const formEl = document.getElementById(formId);
    qsa('.j-form-input', formEl).forEach(function (input) {
      input.addEventListener('input', function () {
        const caret = input.selectionStart;
        const bag = input.getAttribute('data-bag');
        const bind = input.getAttribute('data-bind');
        State[bag][bind] = input.value;
        const formEl = document.getElementById(formId);
        if (formEl) {
          const msg = qs('.c-error-banner, .c-success-banner', formEl);
          if (msg) msg.style.display = 'none';
        }
      });
    });
  }

  /* =====================================================================
     17. GLOBAL EVENT DELEGATION + INIT
     ===================================================================== */
  function init() {
    // Global delegate for static navigation links (like Back buttons)
    document.body.addEventListener('click', function (e) {
      const link = e.target.closest('.j-nav-link');
      if (link && link.hasAttribute('data-j-route')) {
        navigate(link.getAttribute('data-j-route'));
      }
    });

    if (!window.location.hash) window.location.hash = '#/people';
    applyRoute();
  }

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // DOMContentLoaded may have already fired if this script is loaded at the end of <body>
    init();
  }

})();
