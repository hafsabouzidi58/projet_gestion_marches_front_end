import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterRequest } from '../../../services/auth.service';
import { UserService, UserDTO } from '../../../services/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement implements OnInit {

  users: UserDTO[] = [];

  newUser: RegisterRequest = {
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'RESPONSABLE_MARCHES'
  };

  editingUserId: number | null = null;
  isEditing = false;

  loading = false;
  adding = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement utilisateurs :', error);
        this.errorMessage = 'Impossible de charger les utilisateurs.';
        this.loading = false;
      }
    });
  }

  /**
   * Sauvegarder (Création ou Modification)
   */
  saveUser(): void {
    if (this.isEditing) {
      this.updateUser();
    } else {
      this.addUser();
    }
  }

  addUser(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (
      !this.newUser.nom ||
      !this.newUser.prenom ||
      !this.newUser.email ||
      !this.newUser.motDePasse ||
      !this.newUser.role
    ) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.adding = true;

    this.authService.register(this.newUser).subscribe({
      next: () => {
        this.successMessage = 'Utilisateur ajouté avec succès.';
        this.resetForm();
        this.adding = false;
        this.loadUsers();
      },
      error: (error) => {
        console.error('Erreur création :', error);
        this.errorMessage = error.error && typeof error.error === 'string'
          ? error.error
          : 'Erreur lors de la création de l’utilisateur.';
        this.adding = false;
      }
    });
  }

  /**
   * Remplir le formulaire avec les informations de l'utilisateur à modifier
   */
  editUser(user: UserDTO): void {
    if (!user.id) return;

    this.isEditing = true;
    this.editingUserId = user.id;

    this.newUser = {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      motDePasse: '', // Non requis pour l'édition
      role: user.role
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Envoyer les modifications au backend
   */
  updateUser(): void {
    if (!this.editingUserId) return;

    this.successMessage = '';
    this.errorMessage = '';

    const updatedUserDTO: UserDTO = {
      id: this.editingUserId,
      nom: this.newUser.nom,
      prenom: this.newUser.prenom,
      email: this.newUser.email,
      role: this.newUser.role,
      actif: true
    };

    this.adding = true;

    this.userService.updateUser(this.editingUserId, updatedUserDTO).subscribe({
      next: () => {
        this.successMessage = 'Utilisateur mis à jour avec succès.';
        this.resetForm();
        this.adding = false;
        this.loadUsers();
      },
      error: (error) => {
        console.error('Erreur modification :', error);
        this.errorMessage = 'Impossible de modifier l’utilisateur.';
        this.adding = false;
      }
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingUserId = null;
    this.newUser = {
      nom: '',
      prenom: '',
      email: '',
      motDePasse: '',
      role: 'RESPONSABLE_MARCHES'
    };
  }

  toggleUserStatus(user: UserDTO): void {
    if (!user.id) return;

    const action = user.actif ? 'désactiver' : 'activer';
    if (!confirm(`Voulez-vous vraiment ${action} ${user.nom} ${user.prenom} ?`)) return;

    this.successMessage = '';
    this.errorMessage = '';

    this.userService.toggleUserStatus(user.id).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.successMessage = updatedUser.actif
          ? 'Utilisateur activé avec succès.'
          : 'Utilisateur désactivé avec succès.';
      },
      error: (error) => {
        console.error('Erreur changement statut :', error);
        this.errorMessage = 'Impossible de modifier le statut de l’utilisateur.';
      }
    });
  }
}
