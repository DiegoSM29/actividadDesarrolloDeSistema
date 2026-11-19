export default function ProjectMembers({ members, responsable }) {
  return (
    <div className="members-list">
      {members && members.map((email, i) => (
        <div
          key={i}
          className="member-chip"
          data-tooltip={email === responsable ? 'Responsable del proyecto' : 'Miembro del equipo'}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=6C63FF&color=fff&size=24`}
            alt={email}
          />
          <span>{email.split('@')[0]}</span>
          {email === responsable && <span style={{ fontSize: '0.7rem' }}>👑</span>}
        </div>
      ))}
    </div>
  );
}
